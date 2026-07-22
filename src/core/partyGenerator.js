/**
 * 파티 생성기 — 후보 추출, 필터 적용, 핀 반영, 타입 균형 패스
 */

import { getDataset } from '../api/dataset.js';
import { getActivePredicates } from './filters/registry.js';
import { computeWeights, buildCoverageReport } from './typeBalance.js';
import { getPins, getUnpinnedSlots, PARTY_SIZE } from './pinManager.js';
import { getState, dispatch } from '../state/store.js';

/**
 * 가중치 기반 랜덤 샘플링 (중복 없음).
 * @param {import('../api/dataset.js').PokemonEntry[]} pool
 * @param {Map<string, number>} weights
 * @param {number} count
 * @returns {import('../api/dataset.js').PokemonEntry[]}
 */
function weightedSample(pool, weights, count) {
  const remaining = [...pool];
  const picked = [];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((s, p) => s + (weights.get(p.name) ?? 1), 0);
    let rand = Math.random() * totalWeight;
    let idx = 0;
    for (; idx < remaining.length - 1; idx++) {
      rand -= weights.get(remaining[idx].name) ?? 1;
      if (rand <= 0) break;
    }
    picked.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  return picked;
}

/**
 * 파티를 생성한다.
 * - 핀된 슬롯은 유지
 * - 나머지 슬롯을 필터 + 타입 균형으로 채움
 * - "메가 1슬롯 보장" filterValues.megaSlotGuarantee가 true일 때 적용
 */
export function generateParty() {
  const dataset = getDataset();
  const { filterValues } = getState();
  const pins = getPins();
  const unpinnedSlots = getUnpinnedSlots();
  const neededCount = unpinnedSlots.length;

  if (neededCount === 0) return; // 모두 핀됨

  // 1) 활성 predicate 수집
  const predicates = getActivePredicates(filterValues);

  // 진화 단계 유효성 검사: 모두 false면 경고
  const stageVal = filterValues.evolutionStage ?? { includeBasic: true, includeMid: true, includeFinal: true };
  if (!stageVal.includeBasic && !stageVal.includeMid && !stageVal.includeFinal) {
    dispatch({ partyError: '진화 단계를 최소 하나는 선택해야 합니다.' });
    return;
  }

  // 2) 일반 풀 (메가 제외, 전설 포함)
  const generalPool = dataset.filter(
    (p) => !p.isMega && predicates.every((fn) => fn(p))
  );

  // 3) 메가 풀
  const megaPool = dataset.filter(
    (p) => p.isMega && predicates.every((fn) => fn(p))
  );

  // 4) 전설 풀 (전설+환상+준전설, 필터 적용)
  const legendaryPool = generalPool.filter(
    (p) => p.isLegendary || p.isMythical
  );

  // 5) 핀된 멤버
  const pinnedMembers = pins.filter(Boolean);

  // 6) 메가 1마리 고정
  const guaranteeMega      = filterValues.megaSlotGuarantee   ?? false;
  const guaranteeLegendary = filterValues.legendaryGuarantee  ?? false;
  let megaSlot      = null;
  let legendarySlot = null;

  if (guaranteeMega && megaPool.length > 0 && neededCount > 0) {
    const megaWeights = computeWeights(pinnedMembers, megaPool);
    [megaSlot] = weightedSample(megaPool, megaWeights, 1);
  }

  // 7) 전설 1슬롯 최소 보장 (메가 슬롯과 별개)
  const reservedCount = (megaSlot ? 1 : 0);
  if (guaranteeLegendary && legendaryPool.length > 0 && neededCount - reservedCount > 0) {
    const legBase = megaSlot ? [...pinnedMembers, megaSlot] : [...pinnedMembers];
    const legWeights = computeWeights(legBase, legendaryPool);
    [legendarySlot] = weightedSample(legendaryPool, legWeights, 1);
  }

  // 8) 나머지 슬롯을 일반 풀로 채움 (이미 뽑힌 포켓몬 제외)
  const pickedNames = new Set([megaSlot?.name, legendarySlot?.name].filter(Boolean));
  const generalPoolRest = generalPool.filter((p) => !pickedNames.has(p.name));
  const partySoFar = [...pinnedMembers, megaSlot, legendarySlot].filter(Boolean);
  const remainingCount = neededCount - (megaSlot ? 1 : 0) - (legendarySlot ? 1 : 0);

  const generalWeights = computeWeights(partySoFar, generalPoolRest);
  const generalPicks = weightedSample(generalPoolRest, generalWeights, remainingCount);

  // 9) 새 파티 배열 조립
  const newParty = [...pins];
  const picksQueue = [megaSlot, legendarySlot, ...generalPicks].filter(Boolean);

  unpinnedSlots.forEach((slotIdx) => {
    newParty[slotIdx] = picksQueue.shift() ?? null;
  });

  // 8) 커버리지 리포트
  const partyMembers = newParty.filter(Boolean);
  const coverageReport = partyMembers.length > 0
    ? buildCoverageReport(partyMembers)
    : null;

  dispatch({ party: newParty, coverageReport, partyError: null });
}

/**
 * 특정 슬롯만 재롤한다. 핀된 슬롯은 무시.
 * @param {number} slotIndex
 */
export function rerollSlot(slotIndex) {
  const pins = getPins();
  if (pins[slotIndex] !== null) return; // 핀된 슬롯 무시

  const { filterValues, party } = getState();
  const predicates = getActivePredicates(filterValues);

  const generalPool = getDataset().filter(
    (p) => !p.isMega && predicates.every((fn) => fn(p))
  );

  const currentMembers = party.filter((p, i) => p !== null && i !== slotIndex);
  const weights = computeWeights(currentMembers, generalPool);
  const [picked] = weightedSample(generalPool, weights, 1);

  if (!picked) return;

  const newParty = [...party];
  newParty[slotIndex] = picked;

  const coverageReport = buildCoverageReport(newParty.filter(Boolean));
  dispatch({ party: newParty, coverageReport });
}
