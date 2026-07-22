/**
 * DefenseMatchup — poketata 스타일 방어 매치업 패널
 * 약점 목록 (수평 바 + 배수 레이블) + 내성·무효 칩
 */

import { TYPE_MAP } from '../../core/constants/types.js';

/** 최대 표시 약점 수 (접기 전) */
const WEAKNESS_PREVIEW = 4;

/**
 * 방어 매치업 패널을 렌더링한다.
 * @param {HTMLElement} containerEl
 * @param {import('../../core/typeBalance.js').CoverageReport | null} report
 */
export function renderDefenseMatchup(containerEl, report) {
  containerEl.innerHTML = '';

  const heading = document.createElement('h2');
  heading.className = 'analysis-card__title';
  heading.textContent = '방어 매치업';
  containerEl.appendChild(heading);

  if (!report || (report.weaknesses.length === 0 && report.resistances.length === 0 && report.immunities.length === 0)) {
    const empty = document.createElement('p');
    empty.className = 'analysis-empty';
    empty.textContent = '파티를 구성하면 분석 결과가 표시됩니다.';
    containerEl.appendChild(empty);
    return;
  }

  // ── 약점 섹션 ──
  if (report.weaknesses.length > 0) {
    const section = document.createElement('div');
    section.className = 'matchup-section';

    const subheading = document.createElement('h3');
    subheading.className = 'matchup-section__title';
    subheading.textContent = '약점';
    section.appendChild(subheading);

    const list = document.createElement('ul');
    list.className = 'weakness-list';
    list.setAttribute('aria-label', '약점 목록');

    const maxMult = report.weaknesses[0]?.multiplier ?? 1;

    report.weaknesses.forEach((w, idx) => {
      const li = document.createElement('li');
      li.className = 'weakness-row';
      if (idx >= WEAKNESS_PREVIEW) li.style.display = 'none';
      li.setAttribute('role', 'listitem');

      const barWidth = Math.min((w.multiplier / (maxMult || 1)) * 100, 100);

      li.innerHTML = `
        <span class="weakness-type type-badge type-badge--${w.typeId}"
              style="--badge-color:var(--type-${w.typeId})" aria-hidden="true">
          ${TYPE_MAP[w.typeId]?.label ?? w.typeId}
        </span>
        <div class="weakness-bar-wrap" role="presentation">
          <div class="weakness-bar weakness-bar--${w.typeId}"
               style="width:${barWidth}%; background:var(--type-${w.typeId});"
               aria-hidden="true"></div>
        </div>
        <span class="weakness-mult" aria-label="${w.multiplier}배">${w.multiplier}</span>
      `;
      list.appendChild(li);
    });

    section.appendChild(list);

    // "더 보기 / 접기" 토글 버튼
    if (report.weaknesses.length > WEAKNESS_PREVIEW) {
      const showMoreBtn = document.createElement('button');
      showMoreBtn.className = 'show-more-btn';
      showMoreBtn.textContent = '더 보기 ▾';
      let expanded = false;
      showMoreBtn.addEventListener('click', () => {
        expanded = !expanded;
        list.querySelectorAll('.weakness-row').forEach((el, i) => {
          if (i >= WEAKNESS_PREVIEW) el.style.display = expanded ? '' : 'none';
        });
        showMoreBtn.textContent = expanded ? '접기 ▴' : '더 보기 ▾';
      });
      section.appendChild(showMoreBtn);
    }

    containerEl.appendChild(section);
  }

  // ── 내성 & 무효 ──
  const resImmune = [...report.resistances, ...report.immunities];
  if (resImmune.length > 0) {
    const section = document.createElement('div');
    section.className = 'matchup-section';

    const subheading = document.createElement('h3');
    subheading.className = 'matchup-section__title';
    subheading.textContent = '내성 & 무효';
    section.appendChild(subheading);

    const chips = document.createElement('div');
    chips.className = 'resistance-chips';
    chips.setAttribute('role', 'list');
    chips.setAttribute('aria-label', '내성 및 무효 타입');

    resImmune.forEach((r) => {
      const chip = document.createElement('span');
      chip.className = 'resistance-chip';
      chip.setAttribute('role', 'listitem');
      chip.innerHTML = `
        <span class="type-badge type-badge--${r.typeId}"
              style="--badge-color:var(--type-${r.typeId})"
              aria-label="${TYPE_MAP[r.typeId]?.label ?? r.typeId} ${r.multiplier}배">
          ${TYPE_MAP[r.typeId]?.label ?? r.typeId}
        </span>
        <span class="resistance-mult">${r.multiplier}</span>
      `;
      chips.appendChild(chip);
    });

    section.appendChild(chips);
    containerEl.appendChild(section);
  }
}
