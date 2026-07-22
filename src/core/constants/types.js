/**
 * 포켓몬 18타입 목록 및 타입 상성 매트릭스
 * 출처: pokemondb.net/type (PokéAPI / Bulbapedia 컨벤션)
 */

/**
 * @typedef {Object} TypeInfo
 * @property {string} id    - 영문 소문자 (API 기준)
 * @property {string} label - 한국어 표시명
 */

/** @type {TypeInfo[]} */
export const TYPES = [
  { id: 'normal',   label: '노말' },
  { id: 'fire',     label: '불꽃' },
  { id: 'water',    label: '물' },
  { id: 'electric', label: '전기' },
  { id: 'grass',    label: '풀' },
  { id: 'ice',      label: '얼음' },
  { id: 'fighting', label: '격투' },
  { id: 'poison',   label: '독' },
  { id: 'ground',   label: '땅' },
  { id: 'flying',   label: '비행' },
  { id: 'psychic',  label: '에스퍼' },
  { id: 'bug',      label: '벌레' },
  { id: 'rock',     label: '바위' },
  { id: 'ghost',    label: '고스트' },
  { id: 'dragon',   label: '드래곤' },
  { id: 'dark',     label: '악' },
  { id: 'steel',    label: '강철' },
  { id: 'fairy',    label: '페어리' },
];

/** id → TypeInfo 빠른 조회 */
export const TYPE_MAP = Object.fromEntries(TYPES.map((t) => [t.id, t]));

/**
 * 방어 타입 상성 매트릭스
 * DEFENSE_CHART[방어타입][공격타입] = 배수 (0 | 0.25 | 0.5 | 1 | 2 | 4)
 * 1배는 생략 (기본값).
 *
 * @type {Record<string, Record<string, number>>}
 */
export const DEFENSE_CHART = {
  normal:   { fighting: 2, ghost: 0 },
  fire:     { fire: 0.5, water: 2, grass: 0.5, ice: 0.5, ground: 2, bug: 0.5, rock: 2, steel: 0.5, fairy: 0.5 },
  water:    { fire: 0.5, water: 0.5, electric: 2, grass: 2, ice: 0.5, steel: 0.5 },
  electric: { electric: 0.5, ground: 2, flying: 0.5, steel: 0.5 },
  grass:    { fire: 2, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, poison: 2, ground: 0.5, flying: 2, bug: 2 },
  ice:      { fire: 2, ice: 0.5, fighting: 2, rock: 2, steel: 2 },
  fighting: { flying: 2, psychic: 2, bug: 0.5, rock: 0.5, dark: 0.5, fairy: 2 },
  poison:   { grass: 0.5, fighting: 0.5, poison: 0.5, ground: 2, psychic: 2, bug: 0.5, fairy: 0.5 },
  ground:   { water: 2, electric: 0, grass: 2, ice: 2, poison: 0.5, rock: 0.5 },
  flying:   { electric: 2, grass: 0.5, ice: 2, fighting: 0.5, ground: 0, bug: 0.5, rock: 2 },
  psychic:  { fighting: 0.5, psychic: 0.5, bug: 2, ghost: 2, dark: 2 },
  bug:      { fire: 2, grass: 0.5, fighting: 0.5, ground: 0.5, flying: 2, rock: 2 },
  rock:     { normal: 0.5, fire: 0.5, water: 2, grass: 2, fighting: 2, poison: 0.5, ground: 2, flying: 0.5, steel: 2 },
  ghost:    { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2 },
  dragon:   { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, dragon: 2, fairy: 2 },
  dark:     { fighting: 2, psychic: 0, bug: 2, ghost: 0.5, dark: 0.5, fairy: 2 },
  steel:    { normal: 0.5, fire: 2, grass: 0.5, ice: 0.5, fighting: 2, poison: 0, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5 },
  fairy:    { fighting: 0.5, poison: 2, bug: 0.5, dragon: 0, dark: 0.5, steel: 2 },
};

/**
 * 이중 타입 포켓몬의 실질 방어 배수를 계산한다.
 * @param {string[]} defTypes - 포켓몬의 타입 배열 (1–2개)
 * @param {string} atkType    - 공격 타입
 * @returns {number} 최종 배수
 */
export function getEffectiveness(defTypes, atkType) {
  return defTypes.reduce((mult, defType) => {
    return mult * (DEFENSE_CHART[defType]?.[atkType] ?? 1);
  }, 1);
}
