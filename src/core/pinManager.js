/**
 * 핀 매니저 — 핀/언핀 상태 관리
 * 파티 6슬롯 중 최대 5개 핀 가능.
 * 상태는 store.js를 통해 관리된다.
 */

import { getState, dispatch } from '../state/store.js';

export const MAX_PINS = 5;
export const PARTY_SIZE = 6;

/**
 * 현재 핀 배열을 반환한다.
 * @returns {(import('../api/dataset.js').PokemonEntry | null)[]}
 */
export function getPins() {
  return getState().pins;
}

/**
 * 특정 슬롯에 포켓몬을 핀한다.
 * @param {number} slotIndex - 0–5
 * @param {import('../api/dataset.js').PokemonEntry} pokemon
 * @returns {{ ok: boolean, reason?: string }}
 */
export function pinPokemon(slotIndex, pokemon) {
  if (slotIndex < 0 || slotIndex >= PARTY_SIZE) {
    return { ok: false, reason: '유효하지 않은 슬롯 번호입니다.' };
  }

  const pins = [...getState().pins];
  const currentPinCount = pins.filter(Boolean).length;

  // 이미 이 슬롯에 핀되어 있으면 교체 허용
  if (!pins[slotIndex] && currentPinCount >= MAX_PINS) {
    return { ok: false, reason: `핀은 최대 ${MAX_PINS}개까지 가능합니다.` };
  }

  pins[slotIndex] = pokemon;
  dispatch({ pins });
  return { ok: true };
}

/**
 * 특정 슬롯의 핀을 해제한다.
 * @param {number} slotIndex - 0–5
 */
export function unpinSlot(slotIndex) {
  const pins = [...getState().pins];
  pins[slotIndex] = null;
  dispatch({ pins });
}

/**
 * 모든 핀을 해제한다.
 */
export function clearAllPins() {
  dispatch({ pins: [null, null, null, null, null, null] });
}

/**
 * 슬롯이 핀되어 있는지 확인한다.
 * @param {number} slotIndex
 * @returns {boolean}
 */
export function isPinned(slotIndex) {
  return getState().pins[slotIndex] !== null;
}

/**
 * 핀되지 않은 슬롯 인덱스 배열을 반환한다.
 * @returns {number[]}
 */
export function getUnpinnedSlots() {
  return getState().pins
    .map((p, i) => (p === null ? i : -1))
    .filter((i) => i !== -1);
}
