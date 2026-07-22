/**
 * PinSearch — 포켓몬 검색 모달
 * 이름 검색 + 타입 드롭다운 필터 + 전체 결과 표시 (이벤트 위임)
 */

import { getDataset } from '../../api/dataset.js';
import { TYPE_MAP, TYPES } from '../../core/constants/types.js';
import { pinPokemon } from '../../core/pinManager.js';
import { dispatch, getState } from '../../state/store.js';

/** 현재 모달이 열린 대상 슬롯 인덱스 */
let _targetSlot = null;
/** 직접 선택(비핀) 콜백 */
let _onSelect = null;
/** 현재 필터된 풀 (이벤트 위임에서 조회용) */
let _currentPool = [];

/**
 * 검색 모달 컨텐츠를 초기화한다.
 * @param {HTMLElement} panelEl - .modal__panel
 */
export function initPinSearch(panelEl) {
  panelEl.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title" id="modal-title">포켓몬 검색</h2>
      <button class="modal-close-btn" aria-label="검색 모달 닫기" id="modal-close-btn">✕</button>
    </div>
    <div class="modal-filters">
      <input type="search" id="modal-search-input" class="modal-search-input"
             placeholder="이름으로 검색..." aria-label="포켓몬 이름 검색" autocomplete="off" />
      <select id="modal-type1" class="modal-type-select" aria-label="타입 1 필터">
        <option value="">타입 1</option>
        ${TYPES.map((t) => `<option value="${t.id}">${t.label}</option>`).join('')}
      </select>
      <select id="modal-type2" class="modal-type-select" aria-label="타입 2 필터">
        <option value="">타입 2</option>
        ${TYPES.map((t) => `<option value="${t.id}">${t.label}</option>`).join('')}
      </select>
    </div>
    <ul id="modal-results" class="modal-results" role="list" aria-live="polite" aria-label="검색 결과"></ul>
  `;

  panelEl.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  panelEl.querySelector('#modal-search-input').addEventListener('input', _renderResults);
  panelEl.querySelector('#modal-type1').addEventListener('change', _renderResults);
  panelEl.querySelector('#modal-type2').addEventListener('change', _renderResults);

  // 이벤트 위임: 결과 클릭/키보드
  const ul = panelEl.querySelector('#modal-results');
  ul.addEventListener('click', (e) => {
    const li = e.target.closest('.modal-result-item[data-name]');
    if (!li) return;
    _selectByName(li.dataset.name);
  });
  ul.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const li = e.target.closest('.modal-result-item[data-name]');
    if (!li) return;
    e.preventDefault();
    _selectByName(li.dataset.name);
  });
}

/**
 * 모달을 연다.
 * @param {number} slotIndex - 대상 슬롯
 * @param {{ onSelect?: (pokemon, slotIndex) => void }} opts
 */
export function openModal(slotIndex, { onSelect } = {}) {
  _targetSlot = slotIndex;
  _onSelect = onSelect ?? null;

  const modal = document.getElementById('search-modal');
  modal.removeAttribute('hidden');
  modal.querySelector('#modal-search-input')?.focus();

  // 배경 클릭 닫기
  modal.querySelector('.modal__backdrop').onclick = closeModal;

  _renderResults();
}

export function closeModal() {
  const modal = document.getElementById('search-modal');
  modal.setAttribute('hidden', '');
  _targetSlot = null;
  _onSelect = null;
  _currentPool = [];
}

/** data-name 으로 풀에서 포켓몬을 찾아 선택한다. */
function _selectByName(name) {
  const pokemon = _currentPool.find((p) => p.name === name);
  if (!pokemon) return;

  if (_onSelect) {
    _onSelect(pokemon, _targetSlot);
  } else if (_targetSlot !== null) {
    const result = pinPokemon(_targetSlot, pokemon);
    if (!result.ok) { alert(result.reason); return; }
    const newParty = [...getState().party];
    newParty[_targetSlot] = pokemon;
    dispatch({ party: newParty });
  }
  closeModal();
}

/** 필터 조건에 맞는 전체 목록을 렌더링한다 (이벤트 위임, innerHTML 배치). */
function _renderResults() {
  const query = (document.getElementById('modal-search-input')?.value ?? '').toLowerCase().trim();
  const type1 = document.getElementById('modal-type1')?.value ?? '';
  const type2 = document.getElementById('modal-type2')?.value ?? '';

  let pool = getDataset();

  if (query) {
    pool = pool.filter((p) =>
      p.name.includes(query) || p.displayName.toLowerCase().includes(query)
    );
  }
  // 타입 필터: type1 선택 시 해당 타입 포함 포켓몬, type2 추가 시 두 타입 모두 포함
  if (type1) pool = pool.filter((p) => p.types.includes(type1));
  if (type2) pool = pool.filter((p) => p.types.includes(type2));

  // 현재 풀 저장 (이벤트 위임 조회용)
  _currentPool = pool;

  const ul = document.getElementById('modal-results');

  if (pool.length === 0) {
    ul.innerHTML = '<li class="modal-results__empty">검색 결과가 없습니다.</li>';
    return;
  }

  // innerHTML 배치 삽입 (단일 DOM 업데이트 → 성능 최적화)
  ul.innerHTML = pool.map((p) => `
    <li class="modal-result-item" data-name="${p.name}" role="listitem" tabindex="0">
      ${p.spriteUrl
        ? `<img src="${p.spriteUrl}" alt="" class="result-sprite" loading="lazy"
               onerror="this.outerHTML='<span class=\\'result-sprite-placeholder\\' aria-hidden=\\'true\\'>◎</span>'" />`
        : `<span class="result-sprite-placeholder" aria-hidden="true">◎</span>`}
      <span class="result-name">${p.displayName}</span>
      <span class="result-types">
        ${p.types.map((t) =>
          `<span class="type-badge type-badge--${t}" style="--badge-color:var(--type-${t})">${TYPE_MAP[t]?.label ?? t}</span>`
        ).join('')}
      </span>
    </li>
  `).join('');
}
