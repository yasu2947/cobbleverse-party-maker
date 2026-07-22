/**
 * 포켓몬 지역명 상수
 * 필터 및 UI 표시에 사용. 순서는 세대 순.
 */

/**
 * @typedef {Object} RegionInfo
 * @property {string} id       - 영문 소문자 (API 기준)
 * @property {string} label    - 한국어 표시명
 * @property {number} generation
 */

/** @type {RegionInfo[]} */
export const REGIONS = [
  { id: 'kanto',  label: '관동',  generation: 1 },
  { id: 'johto',  label: '성도',  generation: 2 },
  { id: 'hoenn',  label: '호연',  generation: 3 },
  { id: 'sinnoh', label: '신오',  generation: 4 },
  { id: 'unova',  label: '하나',  generation: 5 },
  { id: 'kalos',  label: '칼로스', generation: 6 },
  { id: 'alola',  label: '알로라', generation: 7 },
  { id: 'galar',  label: '가라르', generation: 8 },
  { id: 'paldea', label: '팔데아', generation: 9 },
];

/** id → RegionInfo 빠른 조회용 맵 */
export const REGION_MAP = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
