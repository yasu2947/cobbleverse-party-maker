/**
 * PartyGrid — 6슬롯 파티 그리드
 * 드래그&드롭 재정렬 지원.
 */

import { createPokemonCard, createEmptySlot } from './PokemonCard.js';
import { pinPokemon, unpinSlot, isPinned } from '../../core/pinManager.js';
import { dispatch, getState } from '../../state/store.js';

/** @type {HTMLElement | null} */
let _grid = null;
let _onOpenModal = null; // (slotIndex) => void

/**
 * 그리드를 초기화한다.
 * @param {HTMLElement} gridEl
 * @param {{ onOpenModal: (slotIndex: number) => void }} opts
 */
export function initPartyGrid(gridEl, { onOpenModal }) {
  _grid = gridEl;
  _onOpenModal = onOpenModal;
  _setupDragDrop(gridEl);
}

/**
 * 파티 상태로 그리드를 다시 렌더링한다.
 * @param {(import('../../api/dataset.js').PokemonEntry | null)[]} party
 * @param {(import('../../api/dataset.js').PokemonEntry | null)[]} pins
 */
export function renderPartyGrid(party, pins) {
  if (!_grid) return;
  _grid.innerHTML = '';

  party.forEach((pokemon, i) => {
    const pinned = pins[i] !== null;
    const el = pokemon
      ? createPokemonCard(pokemon, {
          isPinned: pinned,
          slotIndex: i,
          onPin:    _handlePin,
          onRemove: _handleRemove,
          onClick:  _onOpenModal,
        })
      : createEmptySlot(i, _onOpenModal);

    _grid.appendChild(el);
  });
}

function _handlePin(slotIndex) {
  if (isPinned(slotIndex)) {
    unpinSlot(slotIndex);
  } else {
    const party = getState().party;
    const pokemon = party[slotIndex];
    if (pokemon) {
      const result = pinPokemon(slotIndex, pokemon);
      if (!result.ok) alert(result.reason); // 간단 피드백; 추후 토스트로 교체 가능
    }
  }
}

function _handleRemove(slotIndex) {
  const newParty = [...getState().party];
  newParty[slotIndex] = null;
  // 핀도 해제
  unpinSlot(slotIndex);
  dispatch({ party: newParty });
}

// ── 드래그&드롭 재정렬 ──

/** @type {number | null} 드래그 중인 슬롯 인덱스 */
let _dragFrom = null;

function _setupDragDrop(grid) {
  grid.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.pokemon-card:not(.pokemon-card--empty)');
    if (!card) return;
    _dragFrom = parseInt(card.dataset.slot, 10);
    card.classList.add('pokemon-card--dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  grid.addEventListener('dragend', (e) => {
    const card = e.target.closest('.pokemon-card');
    card?.classList.remove('pokemon-card--dragging');
    grid.querySelectorAll('.pokemon-card--drag-over')
        .forEach((el) => el.classList.remove('pokemon-card--drag-over'));
    _dragFrom = null;
  });

  grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('.pokemon-card');
    if (!target) return;
    grid.querySelectorAll('.pokemon-card--drag-over')
        .forEach((el) => el.classList.remove('pokemon-card--drag-over'));
    target.classList.add('pokemon-card--drag-over');
  });

  grid.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.pokemon-card');
    if (!target || _dragFrom === null) return;
    const dragTo = parseInt(target.dataset.slot, 10);
    if (dragTo === _dragFrom) return;
    _swapSlots(_dragFrom, dragTo);
  });
}

function _swapSlots(fromIdx, toIdx) {
  const { party, pins } = getState();
  const newParty = [...party];
  const newPins  = [...pins];
  [newParty[fromIdx], newParty[toIdx]] = [newParty[toIdx], newParty[fromIdx]];
  [newPins[fromIdx],  newPins[toIdx]]  = [newPins[toIdx],  newPins[fromIdx]];
  dispatch({ party: newParty, pins: newPins });
}
