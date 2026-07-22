/**
 * Cobbleverse 스폰 데이터 조회 모듈
 * 번역 없이 엑셀 원문을 직접 사용한다.
 * KR: spawn, condition, formsKR (한글 표시용)
 * EN: spawnEn, conditionEn, forms  (영문 표시용)
 */

import spawnData from './spawnData.json' assert { type: 'json' };

/** PokéAPI 슬러그 접미사 → 한국어 폼 이름 */
const FORM_REGION_MAP_KO = {
  hisuian:   '히스이',
  hisui:     '히스이',
  alolan:    '알로라',
  alola:     '알로라',
  galarian:  '가라르',
  galar:     '가라르',
  paldean:   '팔데아',
  paldea:    '팔데아',
  valencian: '발렌시안',
};

/**
 * PokéAPI 슬러그 → spawnData 엔트리 검색.
 * 지역 폼 접미사 제거 후, 마지막 하이픈 컴포넌트를 반복 제거하며 탐색한다.
 * 예: aegislash-shield → aegislash 발견
 */
function findSpawnEntry(pokemonName) {
  let name = pokemonName
    .replace(/-(hisui|hisuian|alola|alolan|galar|galarian|paldea|paldean)$/, '');

  while (name) {
    const key = name.replace(/[^a-z0-9]/g, '');
    if (spawnData[key]) return spawnData[key];
    const lastHyphen = name.lastIndexOf('-');
    if (lastHyphen === -1) break;
    name = name.slice(0, lastHyphen);
  }
  return null;
}

/**
 * KR 폼/비고 텍스트에서 특정 지역 폼의 서식지를 추출한다.
 * 패턴: "X 형태 출현: Y" 또는 "X 형태는 ... 출현: Y"
 */
function extractKRFormSpawn(formsKR, formKo) {
  if (!formsKR) return null;
  const esc = formKo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = formsKR.match(new RegExp(`${esc}\\s*형태[^:]*:\\s*([^;]+)`));
  if (m) return m[1].replace(/\([^)]*\)/g, '').trim();
  return null;
}

/**
 * EN Forms/Notes 텍스트에서 특정 지역 폼의 서식지를 추출한다.
 * 패턴: "X form spawns in Y"
 */
function extractENFormSpawn(formsEN, keyword) {
  if (!formsEN) return null;
  const kwLower = keyword.toLowerCase();
  const idx = formsEN.toLowerCase().indexOf(kwLower);
  if (idx === -1) return null;
  let chunk = formsEN.slice(idx);
  const next = chunk.slice(keyword.length).search(/\b(Alolan|Galarian|Hisuian|Paldean|Valencian)\b/i);
  if (next > 0) chunk = chunk.slice(0, keyword.length + next);
  const m = chunk.match(/spawns?\s+in\s+(.+?)(?:;|$)/i);
  if (m) return m[1].replace(/\([^)]*\)/g, '').replace(/\.\s*$/, '').trim();
  return null;
}

/** 포켓몬 이름에서 지역 폼 레이블을 반환한다. */
export function getFormLabel(pokemonName) {
  const lower = pokemonName.toLowerCase();
  for (const [suffix, ko] of Object.entries(FORM_REGION_MAP_KO)) {
    if (lower.endsWith(`-${suffix}`)) return `${ko} 폼`;
  }
  if (lower.endsWith('-mega') || lower.includes('-mega-')) return '메가진화';
  return null;
}

/**
 * PokemonEntry에서 Cobbleverse 스폰 정보를 반환한다.
 * 모든 데이터는 엑셀 원문 그대로 사용한다 (번역 없음).
 *
 * @param {import('./dataset.js').PokemonEntry} pokemon
 * @returns {{ biome: string, biomeRaw: string, rarity: string,
 *             condition: string, conditionEn: string,
 *             formNote: string, notes: string, formsList: [] }}
 */
export function getSpawnInfo(pokemon) {
  const entry = findSpawnEntry(pokemon.name);

  if (!entry) {
    return {
      biome: '—', biomeRaw: '—', rarity: '—',
      condition: '', conditionEn: '',
      formNote: '', notes: '코블버스 미등록', formsList: [],
    };
  }

  // 지역 폼 감지: 해당 폼 전용 서식지 추출
  const nameLower  = pokemon.name.toLowerCase();
  const suffixes   = ['hisuian','hisui','alolan','alola','galarian','galar','paldean','paldea'];
  const matchedSfx = suffixes.find(s => nameLower.endsWith(`-${s}`));

  if (matchedSfx) {
    const formKo   = FORM_REGION_MAP_KO[matchedSfx];
    const biome    = extractKRFormSpawn(entry.formsKR, formKo) || entry.spawn || '—';
    const cap      = matchedSfx.charAt(0).toUpperCase() + matchedSfx.slice(1);
    const biomeRaw = extractENFormSpawn(entry.forms, cap)
      ?? extractENFormSpawn(entry.forms, cap.replace(/ian$/, '').replace(/an$/, ''))
      ?? entry.spawnEn ?? '—';

    return {
      biome,
      biomeRaw,
      rarity:      entry.rarity || '—',
      condition:   '',
      conditionEn: '',
      formNote:    `${formKo} 폼`,
      notes:       '',
      formsList:   [],
    };
  }

  return {
    biome:       entry.spawn        || '—',
    biomeRaw:    entry.spawnEn      || '—',
    rarity:      entry.rarity       || '—',
    condition:   entry.condition    || '',
    conditionEn: entry.conditionEn  || '',
    formNote:    '',
    notes:       entry.formsKR      || '',
    formsList:   [],
  };
}
