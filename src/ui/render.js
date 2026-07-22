/**
 * render.js — DOM 렌더링 오케스트레이터
 * store 구독 → 각 컴포넌트의 render 함수 호출
 */

import { subscribe, getState } from '../state/store.js';
import { initPartyGrid, renderPartyGrid } from './components/PartyGrid.js';
import { initFilterPanel } from './components/FilterPanel.js';
import { initPinSearch, openModal, closeModal } from './components/PinSearch.js';
import { renderDefenseMatchup } from './components/DefenseMatchup.js';

/**
 * 앱 UI를 초기화하고 store 구독을 설정한다.
 * buildDataset() 완료 후 호출해야 한다.
 */
export function initUI() {
  const appRoot      = document.getElementById('app');
  const filterSidebar = document.getElementById('filter-sidebar');
  const partyGrid    = document.getElementById('party-grid');
  const defenseEl    = document.getElementById('matchup-panel');
  const modalPanel  = document.querySelector('.modal__panel');
  // ── 컴포넌트 초기화 ──
  initPartyGrid(partyGrid, { onOpenModal: openModal });
  initFilterPanel(filterSidebar);
  initPinSearch(modalPanel);

  // ── 초기 렌더링 ──
  const state = getState();
  renderPartyGrid(state.party, state.pins);
  renderDefenseMatchup(defenseEl, state.coverageReport);

  // ── ESC → 모달 닫기 ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ── store 구독 ──
  subscribe('party', (party) => {
    const { pins } = getState();
    renderPartyGrid(party, pins);
  });

  subscribe('pins', (pins) => {
    const { party } = getState();
    renderPartyGrid(party, pins);
  });

  subscribe('coverageReport', (report) => {
    renderDefenseMatchup(defenseEl, report);
  });

  subscribe('filterValues', () => {
    initFilterPanel(filterSidebar);
  });

  subscribe('partyError', (err) => {
    if (err) {
      // 간단 피드백 — 추후 토스트 컴포넌트로 교체 가능
      const existing = document.getElementById('party-error-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'party-error-toast';
      toast.className = 'toast toast--error';
      toast.setAttribute('role', 'alert');
      toast.textContent = err;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  });

  // 앱 표시
  appRoot.removeAttribute('hidden');
}
