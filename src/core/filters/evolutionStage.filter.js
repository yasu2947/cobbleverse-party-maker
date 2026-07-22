/**
 * 필터: 진화 단계 토글
 * 미진화(basic) / 중간진화 / 완전진화(final) 포함 여부를 제어한다.
 * 최소 1개 단계는 활성화되어야 한다 (partyGenerator에서 검증).
 */

/**
 * @typedef {Object} EvolutionStageValue
 * @property {boolean} includeBasic  - 미진화 포함
 * @property {boolean} includeMid    - 중간 단계 포함 (stage1, stage2)
 * @property {boolean} includeFinal  - 완전진화 포함
 */

/** @type {import('./registry.js').FilterModule} */
const evolutionStageFilter = {
  id:    'evolutionStage',
  label: '진화 단계',
  uiType: 'switchGroup',
  options: [
    { id: 'includeBasic', label: '미진화 포함' },
    { id: 'includeMid',   label: '중간 단계 포함' },
    { id: 'includeFinal', label: '완전진화 포함' },
  ],
  /** @type {EvolutionStageValue} */
  defaultValue: { includeBasic: true, includeMid: true, includeFinal: true },

  /**
   * 진화 단계 조건에 맞으면 통과(true).
   * @param {import('../../api/dataset.js').PokemonEntry} pokemon
   * @param {EvolutionStageValue} value
   */
  predicate(pokemon, value) {
    const stage = pokemon.evolutionStage;
    if (stage === 'basic')                       return value.includeBasic;
    if (stage === 'stage1' || stage === 'stage2') return value.includeMid;
    if (stage === 'final')                        return value.includeFinal;
    // evolutionStage를 알 수 없으면 포함
    return true;
  },
};

export default evolutionStageFilter;
