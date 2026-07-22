/**
 * 필터: 메가 카테고리 제어
 * 프로토타입 기준: 세 가지 독립 토글칩 (기본 포함, 클릭 → 제외)
 *   - Standard Mega  (formType: 'mega')
 *   - Z-Mega         (formType: 'mega-z')
 *   - Legendary Mega (isMega && (isLegendary || isMythical))
 *
 * 이 필터는 메가 포켓몬의 "일반 풀 포함/제외"를 관리한다.
 * "메가 1슬롯 보장" 로직은 partyGenerator.js에서 처리.
 */

/**
 * @typedef {Object} MegaCategoryValue
 * @property {boolean} excludeStandard    - 표준 메가 제외
 * @property {boolean} excludeMegaZ       - Z 메가 제외
 * @property {boolean} excludeLegendaryMega - 전설 메가 제외
 */

/** @type {import('./registry.js').FilterModule} */
const megaCategoryFilter = {
  id:    'megaCategory',
  label: '메가 카테고리',
  uiType: 'chipGroup',
  options: [
    { id: 'excludeStandard',      label: '표준 메가',  toggleLabel: 'Standard Mega' },
    { id: 'excludeMegaZ',         label: 'Z 메가',     toggleLabel: 'Z-Mega' },
    { id: 'excludeLegendaryMega', label: '전설 메가',  toggleLabel: 'Legendary Mega' },
  ],
  /** @type {MegaCategoryValue} */
  defaultValue: {
    excludeStandard:      false,
    excludeMegaZ:         false,
    excludeLegendaryMega: false,
  },

  /**
   * 제외 설정에 해당하는 메가 포켓몬은 제외(false).
   * @param {import('../../api/dataset.js').PokemonEntry} pokemon
   * @param {MegaCategoryValue} value
   */
  predicate(pokemon, value) {
    if (!pokemon.isMega) return true;

    const isLegendaryMega = pokemon.isMega && (pokemon.isLegendary || pokemon.isMythical);
    if (isLegendaryMega && value.excludeLegendaryMega) return false;

    if (pokemon.formType === 'mega-z' && value.excludeMegaZ) return false;
    if (pokemon.formType === 'mega'   && value.excludeStandard) return false;

    return true;
  },
};

export default megaCategoryFilter;
