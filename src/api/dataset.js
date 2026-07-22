/**
 * 전체 포켓몬 풀 빌드·정규화
 * PokéAPI에서 전체 목록을 1회 fetch하고 megaZ 패치를 병합한다.
 * 이후 getDataset()으로 캐시된 풀 반환.
 */

import { fetchAllPages, fetchBatch, fetchFromApi } from './pokeApiClient.js';
import megaZPatch from './patches/megaZ.patch.json' assert { type: 'json' };

/**
 * @typedef {Object} PokemonEntry
 * @property {number}   id
 * @property {string}   name          - API 슬러그 (예: 'charizard-mega-x')
 * @property {string}   displayName   - 표시용 한국어/영어 이름
 * @property {string[]} types         - 예: ['fire', 'flying']
 * @property {number}   generation    - 1–9
 * @property {string}   region        - 예: 'kanto'
 * @property {boolean}  isLegendary
 * @property {boolean}  isMythical
 * @property {boolean}  isMega
 * @property {boolean}  isBaby
 * @property {string}   evolutionStage - 'basic' | 'stage1' | 'stage2' | 'final'
 * @property {string}   formType       - 'standard' | 'regional' | 'mega' | 'mega-z'
 * @property {boolean}  canZMove
 * @property {string}   spriteUrl
 */

/** @type {PokemonEntry[] | null} */
let _dataset = null;

/**
 * localStorage 캐시 키 — 데이터 구조가 바뀌면 버전 올릴 것.
 * 버전 변경 시 사용자 브라우저의 이전 캐시는 자동 무효화된다.
 */
const CACHE_KEY = 'cobble_dataset_v3';

/** 지역명 → 세대 매핑 */
const REGION_TO_GEN = {
  kanto: 1, johto: 2, hoenn: 3, sinnoh: 4,
  unova: 5, kalos: 6, alola: 7, galar: 8, paldea: 9,
};

/** generation 번호 → region 이름 */
const GEN_TO_REGION = Object.fromEntries(
  Object.entries(REGION_TO_GEN).map(([r, g]) => [g, r])
);

/**
 * 배틀 중에만 자동으로 폼이 전환되는 개체(조작 불가).
 * buildDataset에서 풀에서 제외한다.
 */
const BATTLE_ONLY_FORMS = new Set([
  // 배틀 중 자동 전환 (공격/방어/날씨 등)
  'aegislash-blade',
  'castform-sunny', 'castform-rainy', 'castform-snowy',
  'cherrim-sunshine',
  'meloetta-pirouette',
  'wishiwashi-school',
  'mimikyu-busted',
  'eiscue-noice',
  'morpeko-hangry',
  'darmanitan-zen', 'darmanitan-galar-zen',
  'zygarde-complete',
  'palafin-hero',
  'minior-red-core',   'minior-orange-core', 'minior-yellow-core',
  'minior-green-core', 'minior-blue-core',   'minior-indigo-core', 'minior-violet-core',
  // 울트라 폼 (배틀 중 전환, 배틀 후 복귀)
  'necrozma-ultra',
  // 테라파고스 배틀 변환
  'terapagos-terastal', 'terapagos-stellar',
  // 코라이돈/미라이돈 이동 수단 폼 (스프라이트 없음, 배틀과 무관)
  'koraidon-limited-build', 'koraidon-sprinting-build',
  'koraidon-swimming-build', 'koraidon-gliding-build',
  'miraidon-low-power-mode', 'miraidon-drive-mode',
  'miraidon-aquatic-mode',   'miraidon-glide-mode',
]);

/**
 * 폼 접미사가 있는 비지역 변형 포켓몬 → 한국어 폼 이름
 * displayName 뒤에 태그로 붙인다.
 */
const FORM_VARIANT_KO = {
  'urshifu-single-strike': '일격',  // 단타 스타일
  'urshifu-rapid-strike':  '연격',  // 연격 스타일
};

/** 지역 폼 접미사 → 한국어 접두사 */
const REGIONAL_PREFIX_KO = {
  alolan: '알로라', alola: '알로라',
  galarian: '가라르', galar: '가라르',
  hisuian: '히스이',  hisui: '히스이',
  paldean: '팔데아',  paldea: '팔데아',
};

/**
 * 포켓몬 이름에서 formType을 판별한다.
 * @param {string} name
 * @returns {'mega-z' | 'mega' | 'regional' | 'gmax' | 'standard'}
 */
function detectFormType(name) {
  if (/-mega-z$/.test(name)) return 'mega-z';
  if (/-mega/.test(name)) return 'mega';
  if (/(-(alolan|galarian|hisuian|paldean|galar|hisui|alola|paldea))/.test(name)) return 'regional';
  if (/-gmax$/.test(name)) return 'gmax';
  return 'standard';
}

/**
 * pokemon API 응답 + species 응답을 PokemonEntry로 정규화한다.
 * @param {object} pokemon
 * @param {object} species
 * @returns {PokemonEntry}
 */
function normalizeEntry(pokemon, species) {
  const formType = detectFormType(pokemon.name);
  const genNum = species.generation?.url
    ? parseInt(species.generation.url.match(/\/(\d+)\/?$/)?.[1] ?? '1')
    : 1;
  const region = GEN_TO_REGION[genNum] ?? 'kanto';

  // 공식 아트워크 우선, 없으면 기본 스프라이트
  const spriteUrl =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.other?.home?.front_default ||
    pokemon.sprites?.front_default ||
    '';

  // 이로치 스프라이트
  const spriteUrlShiny =
    pokemon.sprites?.other?.['official-artwork']?.front_shiny ||
    pokemon.sprites?.other?.home?.front_shiny ||
    pokemon.sprites?.front_shiny ||
    '';

  // 종족값 { hp, attack, defense, special-attack, special-defense, speed }
  const stats = Object.fromEntries(
    (pokemon.stats ?? []).map((s) => [s.stat.name, s.base_stat])
  );

  // 특성 [{ name(slug), isHidden }]
  const abilities = (pokemon.abilities ?? []).map((a) => ({
    name: a.ability.name,
    isHidden: a.is_hidden,
  }));

  // 진화 단계 — evolution_chain 없이 간이 판별
  let evolutionStage = 'final';
  if (species.evolves_from_species == null) evolutionStage = 'basic';
  else if (species.is_baby) evolutionStage = 'basic';

  // 표시명 생성
  const baseName = species.names?.find((n) => n.language.name === 'ko')?.name
                ?? species.names?.find((n) => n.language.name === 'en')?.name
                ?? pokemon.name;
  let displayName = baseName;
  if (formType === 'mega' || formType === 'mega-z') {
    // 메가 폼: "메가 {이름} [X/Y/Z]"
    let variant = '';
    if (pokemon.name.endsWith('-mega-x')) variant = ' X';
    else if (pokemon.name.endsWith('-mega-y')) variant = ' Y';
    else if (formType === 'mega-z') variant = ' Z';
    displayName = `메가 ${baseName}${variant}`;
  } else if (formType === 'regional') {
    // 지역 폼: "히스이 윈디", "알로라 라이츄" 형식
    const m = pokemon.name.match(/-(alolan|galarian|hisuian|paldean|alola|galar|hisui|paldea)$/);
    if (m) displayName = `${REGIONAL_PREFIX_KO[m[1]]} ${baseName}`;
  } else if (FORM_VARIANT_KO[pokemon.name]) {
    // 변형 폼: "우라오스 일격" / "우라오스 연격"
    displayName = `${baseName} ${FORM_VARIANT_KO[pokemon.name]}`;
  }

  return {
    id:             pokemon.id,
    name:           pokemon.name,
    displayName,
    types:          pokemon.types.map((t) => t.type.name),
    generation:     genNum,
    region,
    isLegendary:    species.is_legendary ?? false,
    isMythical:     species.is_mythical ?? false,
    isMega:         formType === 'mega' || formType === 'mega-z',
    isBaby:         species.is_baby ?? false,
    evolutionStage,
    formType,
    canZMove:       false,
    spriteUrl,
    spriteUrlShiny,
    stats,
    abilities,
    gmaxSpriteUrl:  '',   // buildDataset 후처리에서 채움
  };
}

/**
 * 전체 포켓몬 풀을 빌드한다. 최초 1회만 실행된다.
 * @param {{ onProgress?: (done: number, total: number) => void }} opts
 * @returns {Promise<PokemonEntry[]>}
 */
export async function buildDataset({ onProgress } = {}) {
  if (_dataset) return _dataset;

  // 0) localStorage 캐시 확인 — 있으면 API 호출 없이 즉시 반환
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      _dataset = JSON.parse(raw);
      onProgress?.(1, 1);
      return _dataset;
    }
  } catch (_) { /* 파싱 오류 시 무시하고 API에서 재fetch */ }

  // 1) 전체 pokemon 목록 수집 (slug + url)
  const allEntries = await fetchAllPages('/pokemon?limit=100');

  // 2) 각 pokemon 상세 + species 상세를 배치 fetch
  const pokemonData = await fetchBatch(
    allEntries.map((e) => e.url),
    { concurrency: 20, onProgress: (d, t) => onProgress?.(d, t * 2) }
  );

  const speciesUrls = pokemonData.map((p) => p.species.url);
  const speciesData = await fetchBatch(
    speciesUrls,
    { concurrency: 20, onProgress: (d, t) => onProgress?.(t + d, t * 2) }
  );

  // 3) 정규화
  const normalized = pokemonData.map((p, i) => normalizeEntry(p, speciesData[i]));

  // 3.5) 진화 단계 정밀 분류
  // ① 다음 진화가 있는 species 이름 집합 구성
  const speciesWithNextEvo = new Set();
  for (const sp of speciesData) {
    if (sp.evolves_from_species?.name) {
      speciesWithNextEvo.add(sp.evolves_from_species.name);
    }
  }
  // ② 각 엔트리의 evolutionStage 재보정
  //    basic  = 이전 진화 없음 + 다음 진화 있음 (이상해씨, 파이리 등 1단계)
  //    stage1 = 이전 진화 있음 + 다음 진화 있음 (이상해풀, 리자드 등 중간단계)
  //    final  = 다음 진화 없음 (최종진화 + 단일진화 모두)
  for (let i = 0; i < normalized.length; i++) {
    const sp  = speciesData[i];
    const pre  = sp.evolves_from_species != null;
    const next = speciesWithNextEvo.has(sp.name);
    normalized[i].evolutionStage =
      !pre && next ? 'basic'  :   // 1단계
       pre && next ? 'stage1' :   // 중간단계
                     'final';     // 최종 or 단일진화
  }

  // 4) megaZ 패치 병합 (API 미지원 항목)
  const patchEntries = megaZPatch.entries ?? [];
  const existingNames = new Set(normalized.map((e) => e.name));
  const newPatches = patchEntries.filter((e) => !existingNames.has(e.name));

  // 5a) 거다이 스프라이트 URL을 베이스 폼에 이식
  const gmaxSpriteMap = new Map();
  for (const e of normalized) {
    if (e.formType === 'gmax') {
      const baseName = e.name.replace(/-gmax$/, '');
      gmaxSpriteMap.set(baseName, e.spriteUrl);
    }
  }
  for (const e of normalized) {
    if (gmaxSpriteMap.has(e.name)) e.gmaxSpriteUrl = gmaxSpriteMap.get(e.name);
  }

  // 5b) 거다이맥스 + 배틀 전용 폼 제외
  _dataset = [...normalized, ...newPatches].filter(
    (e) => e.formType !== 'gmax' && !BATTLE_ONLY_FORMS.has(e.name)
  );

  // 6) localStorage에 캐시 저장 (다음 로드부터 API 호출 생략)
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(_dataset));
  } catch (_) { /* 용량 초과 등 실패 시 조용히 무시 */ }

  return _dataset;
}

/**
 * 캐시된 데이터셋을 반환한다. buildDataset() 완료 후 호출해야 한다.
 * @returns {PokemonEntry[]}
 */
export function getDataset() {
  if (!_dataset) throw new Error('buildDataset()을 먼저 호출해야 합니다.');
  return _dataset;
}
