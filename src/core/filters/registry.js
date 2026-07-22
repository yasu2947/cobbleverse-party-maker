/**
 * 필터 레지스트리 — 필터 등록·조회의 단일 진입점
 * 새 필터 추가: *.filter.js 생성 + 이 파일에 import 1줄.
 * 필터 제거: 파일 삭제 + import 줄 삭제. 다른 코드 수정 없음.
 */

import regionExclusionFilter from './regionExclusion.filter.js';
import evolutionStageFilter  from './evolutionStage.filter.js';
import megaCategoryFilter    from './megaCategory.filter.js';

/**
 * @typedef {Object} FilterModule
 * @property {string}   id           - camelCase 고유 ID
 * @property {string}   label        - UI 표시 레이블
 * @property {string}   uiType       - 'toggle' | 'multiSelect' | 'chipGroup' | 'switchGroup'
 * @property {any[]}    [options]    - multiSelect/chipGroup용 선택지
 * @property {any}      defaultValue
 * @property {(pokemon: import('../../api/dataset.js').PokemonEntry, value: any) => boolean} predicate
 */

/** @type {Map<string, FilterModule>} */
const _registry = new Map();

/**
 * 필터를 등록한다.
 * @param {FilterModule} filterModule
 */
export function registerFilter(filterModule) {
  if (_registry.has(filterModule.id)) {
    console.warn(`[registry] 중복 필터 ID: ${filterModule.id}`);
  }
  _registry.set(filterModule.id, filterModule);
}

/**
 * 등록된 필터 전체를 반환한다.
 * @returns {FilterModule[]}
 */
export function getAllFilters() {
  return [..._registry.values()];
}

/**
 * 현재 filterValues로 활성화된 predicate 목록을 반환한다.
 * @param {Record<string, any>} filterValues - store의 filterValues
 * @returns {Array<(pokemon: object) => boolean>}
 */
export function getActivePredicates(filterValues) {
  return [..._registry.values()].map((f) => {
    const value = filterValues[f.id] ?? f.defaultValue;
    return (pokemon) => f.predicate(pokemon, value);
  });
}

/**
 * 필터 기본값 맵을 반환한다. store 초기화 시 사용.
 * @returns {Record<string, any>}
 */
export function getDefaultFilterValues() {
  return Object.fromEntries(
    [..._registry.values()].map((f) => [f.id, f.defaultValue])
  );
}

// ── 자동 등록 ──
registerFilter(regionExclusionFilter);
registerFilter(evolutionStageFilter);
registerFilter(megaCategoryFilter);
