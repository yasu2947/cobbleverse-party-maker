/**
 * 필터: 지역별 전설/환상 포켓몬 제외
 * 선택된 지역의 전설·환상 포켓몬을 풀에서 제외한다.
 */

import { REGIONS } from '../constants/regions.js';

/** @type {import('./registry.js').FilterModule} */
const regionExclusionFilter = {
  id:           'regionExclusion',
  label:        '전설 제외 지역',
  uiType:       'chipGroup',
  options:      REGIONS,  // { id, label, generation }[]
  // 기본값: 빈 배열 (모든 지역 전설 포함)
  defaultValue: [],

  /**
   * 해당 지역의 전설·환상이면 제외(false), 그 외 통과(true).
   * @param {import('../../api/dataset.js').PokemonEntry} pokemon
   * @param {string[]} excludedRegionIds
   */
  predicate(pokemon, excludedRegionIds) {
    if (!excludedRegionIds.length) return true;
    if (!(pokemon.isLegendary || pokemon.isMythical)) return true;
    return !excludedRegionIds.includes(pokemon.region);
  },
};

export default regionExclusionFilter;
