/**
 * 타입 균형 가중치 계산 + 방어 매치업 리포트 생성
 * poketata.com/type-coverage 스타일: 약점 목록 + 내성·무효 칩
 */

import { TYPES, getEffectiveness } from './constants/types.js';

/**
 * @typedef {Object} WeaknessEntry
 * @property {string} typeId      - 공격 타입 ID
 * @property {string} typeLabel   - 한국어 타입명
 * @property {number} multiplier  - 최대 배수 (파티 내 가장 약한 멤버 기준)
 * @property {number} count       - 해당 배수 이상에 해당하는 파티 멤버 수
 */

/**
 * @typedef {Object} ResistanceEntry
 * @property {string} typeId
 * @property {string} typeLabel
 * @property {number} multiplier  - 최소 배수 (0, 0.25, 0.5)
 */

/**
 * @typedef {Object} CoverageReport
 * @property {WeaknessEntry[]}    weaknesses    - 배수 내림차순 정렬
 * @property {ResistanceEntry[]}  resistances   - 내성 (0.5 이하, 0 제외)
 * @property {ResistanceEntry[]}  immunities    - 무효 (0)
 */

/**
 * 파티(핀 포함)를 기준으로 후보 포켓몬의 타입 가중치를 계산한다.
 * 파티에서 미대표 타입에 높은 가중치를 부여해 균형을 유도.
 *
 * @param {import('../api/dataset.js').PokemonEntry[]} partyMembers - 현재 파티 (null 슬롯 제외)
 * @param {import('../api/dataset.js').PokemonEntry[]} candidates   - 후보 풀
 * @returns {Map<string, number>} 포켓몬 name → 가중치
 */
export function computeWeights(partyMembers, candidates) {
  // 현재 파티의 타입 출현 빈도
  const typeFreq = Object.fromEntries(TYPES.map((t) => [t.id, 0]));
  partyMembers.forEach((p) => {
    p.types.forEach((t) => { typeFreq[t] = (typeFreq[t] ?? 0) + 1; });
  });

  const weights = new Map();
  candidates.forEach((c) => {
    // 후보 타입이 파티에서 적을수록 가중치 높음
    const score = c.types.reduce((sum, t) => {
      const freq = typeFreq[t] ?? 0;
      return sum + 1 / (freq + 1);
    }, 0);
    weights.set(c.name, score);
  });

  return weights;
}

/**
 * 파티 전체의 방어 매치업 리포트를 생성한다.
 * @param {import('../api/dataset.js').PokemonEntry[]} partyMembers - null 슬롯 제외
 * @returns {CoverageReport}
 */
export function buildCoverageReport(partyMembers) {
  const weaknesses  = [];
  const resistances = [];
  const immunities  = [];

  TYPES.forEach(({ id: atkType, label }) => {
    // 파티 멤버별 실질 배수 계산
    const mults = partyMembers.map((p) => getEffectiveness(p.types, atkType));
    const maxMult = Math.max(...mults);
    const weakCount = mults.filter((m) => m > 1).length;

    if (maxMult >= 2) {
      weaknesses.push({ typeId: atkType, typeLabel: label, multiplier: maxMult, count: weakCount });
    }

    const minMult = Math.min(...mults);
    if (minMult === 0) {
      immunities.push({ typeId: atkType, typeLabel: label, multiplier: 0 });
    } else if (minMult <= 0.5) {
      resistances.push({ typeId: atkType, typeLabel: label, multiplier: minMult });
    }
  });

  // 약점: 배수 내림차순 → 같은 배수면 count 내림차순
  weaknesses.sort((a, b) => b.multiplier - a.multiplier || b.count - a.count);

  return { weaknesses, resistances, immunities };
}
