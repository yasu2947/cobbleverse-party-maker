/**
 * main.js — 앱 진입점
 * 데이터셋 로드 → UI 초기화 순으로 실행.
 */

import { buildDataset } from './api/dataset.js';
import { dispatch } from './state/store.js';
import { getDefaultFilterValues } from './core/filters/registry.js';
import { initUI } from './ui/render.js';

async function main() {
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingStatus  = document.getElementById('loading-status');
  const loadingBar     = document.getElementById('loading-bar');

  // 필터 기본값 초기화
  dispatch({ filterValues: getDefaultFilterValues() });

  try {
    await buildDataset({
      onProgress(done, total) {
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        if (loadingStatus) loadingStatus.textContent = `포켓몬 데이터 로딩 중... ${pct}%`;
        if (loadingBar) {
          loadingBar.style.width = `${pct}%`;
          loadingBar.setAttribute('aria-valuenow', pct);
        }
      },
    });

    dispatch({ loading: false });

    // 로딩 오버레이 페이드 아웃
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      loadingOverlay.addEventListener('transitionend', () => loadingOverlay.remove(), { once: true });
    }

    initUI();
  } catch (err) {
    console.error('[main] 데이터 로드 실패:', err);
    if (loadingStatus) {
      loadingStatus.textContent = '데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
    }
  }
}

main();
