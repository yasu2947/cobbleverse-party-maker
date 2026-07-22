/**
 * AcquisitionInfo — Cobbleverse 스폰 정보 테이블
 * 파티 6마리의 실제 스폰 위치, 희귀도, 조건, 비고를 표시한다.
 * 데이터 출처: lumyverse.com/cobbleverse/all-pokemon-spawn-in-cobbleverse/
 */

import { getSpawnInfo } from '../../api/spawnLookup.js';

/** 희귀도(KR) → CSS 수식어 */
const RARITY_MOD = {
  '흔함':              'common',
  '흔치않음':          'uncommon',
  '흔치않음/희귀함':   'uncommon',
  '희귀함':            'rare',
  '희귀/흔치않음':     'rare',
  '매우 희귀함':       'ultra',
  '전설':              'legendary',
};

/**
 * 획득 정보 패널을 렌더링한다.
 * @param {HTMLElement} containerEl
 * @param {(import('../../api/dataset.js').PokemonEntry | null)[]} party
 */
export function renderAcquisitionInfo(containerEl, party) {
  containerEl.innerHTML = '';

  // 헤더: 제목 + 한/EN 토글 버튼
  const header = document.createElement('div');
  header.className = 'acq-header';

  const heading = document.createElement('h2');
  heading.className = 'analysis-card__title';
  heading.textContent = '획득 정보';

  const langToggle = document.createElement('button');
  langToggle.className = 'acq-lang-toggle';
  langToggle.textContent = 'EN';
  langToggle.setAttribute('aria-pressed', 'false');
  langToggle.title = '장소 표기 한글 ↔ 영어 전환';

  header.appendChild(heading);
  header.appendChild(langToggle);
  containerEl.appendChild(header);

  const members = party.filter(Boolean);
  if (members.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'analysis-empty';
    empty.textContent = '파티를 구성하면 스폰 정보가 표시됩니다.';
    containerEl.appendChild(empty);
    return;
  }

  const table = document.createElement('table');
  table.className = 'acquisition-table';
  table.setAttribute('role', 'table');
  table.setAttribute('aria-label', '획득 정보 테이블');

  const rows = members.map((p) => {
    const { biome, biomeRaw, rarity, condition, formNote, notes, formsList } = getSpawnInfo(p);
    const mod = RARITY_MOD[rarity] ?? 'common';
    const notesContent = notes ? escapeHtml(notes) : '';

    const mainRow = `
      <tr>
        <td class="acq-name">
          <span class="acq-pokemon-name">${escapeHtml(p.displayName)}</span>
          ${formNote ? `<span class="acq-form-badge">${escapeHtml(formNote)}</span>` : ''}
        </td>
        <td class="acq-biome">
          <span class="biome-ko">${escapeHtml(biome)}</span>
          <span class="biome-en">${escapeHtml(biomeRaw ?? biome)}</span>
        </td>
        <td class="acq-rarity">
          <span class="rarity-badge rarity-badge--${mod}">${escapeHtml(rarity)}</span>
        </td>
        <td class="acq-condition">${condition ? escapeHtml(condition) : '—'}</td>
        <td class="acq-notes">${notesContent}</td>
      </tr>
    `;

    const formRows = (formsList ?? []).map((f) => `
      <tr class="acq-form-subrow">
        <td></td>
        <td class="acq-biome">
          <span class="form-tag">${escapeHtml(f.name)}</span>
          <span class="biome-ko">${escapeHtml(f.spawn)}</span>
          <span class="biome-en">${escapeHtml(f.spawn)}</span>
        </td>
        <td></td>
        <td class="acq-condition">${f.condition ? escapeHtml(f.condition) : ''}</td>
        <td></td>
      </tr>
    `).join('');

    return mainRow + formRows;
  }).join('');

  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">포켓몬</th>
        <th scope="col">장소</th>
        <th scope="col">희귀도</th>
        <th scope="col">조건</th>
        <th scope="col">비고</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  `;

  containerEl.appendChild(table);

  // 토글: CSS 클래스 전환만으로 한/영 스왑 (재렌더링 없음)
  langToggle.addEventListener('click', () => {
    const isEn = table.classList.toggle('acquisition-table--en');
    langToggle.setAttribute('aria-pressed', String(isEn));
    langToggle.classList.toggle('acq-lang-toggle--active', isEn);
  });
}

/** XSS 방지용 HTML 이스케이프 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
