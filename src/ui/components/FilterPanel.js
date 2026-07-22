/**
 * FilterPanel — 레지스트리에서 필터 목록을 읽어 렌더링
 * 개별 필터를 직접 import하지 않는다.
 */

import { getAllFilters } from '../../core/filters/registry.js';
import { setFilterValue, getState } from '../../state/store.js';
import { generateParty } from '../../core/partyGenerator.js';

/**
 * 필터 사이드바를 초기화하고 렌더링한다.
 * @param {HTMLElement} sidebarEl
 */
export function initFilterPanel(sidebarEl) {
  sidebarEl.innerHTML = '';

  // ── 랜덤 파티 생성 버튼 ──
  const genBtn = document.createElement('button');
  genBtn.id = 'generate-btn';
  genBtn.className = 'generate-btn';
  genBtn.textContent = '파티 랜덤 돌리기';
  genBtn.setAttribute('aria-label', '랜덤 파티 생성');
  genBtn.addEventListener('click', generateParty);
  sidebarEl.appendChild(genBtn);

  // ── 메가 1마리 고정 토글 ──
  const megaGuaranteeWrap = _buildToggle({
    id:    'megaSlotGuarantee',
    label: '메가 1마리 고정',
    value: getState().filterValues.megaSlotGuarantee ?? false,
    onChange: (v) => setFilterValue('megaSlotGuarantee', v),
  });
  sidebarEl.appendChild(megaGuaranteeWrap);

  // ── 전설/환상/준전설 1슬롯 최소 보장 토글 ──
  const legendaryGuaranteeWrap = _buildToggle({
    id:    'legendaryGuarantee',
    label: '전설 1마리 보장',
    value: getState().filterValues.legendaryGuarantee ?? false,
    onChange: (v) => setFilterValue('legendaryGuarantee', v),
  });
  sidebarEl.appendChild(legendaryGuaranteeWrap);

  // ── 레지스트리 필터들 ──
  getAllFilters().forEach((filter) => {
    const section = document.createElement('section');
    section.className = 'filter-section';
    section.setAttribute('aria-labelledby', `filter-label-${filter.id}`);

    const heading = document.createElement('h3');
    heading.id = `filter-label-${filter.id}`;
    heading.className = 'filter-section__title';
    heading.textContent = filter.label;
    section.appendChild(heading);

    const control = _buildControl(filter);
    section.appendChild(control);
    sidebarEl.appendChild(section);

    // 메가 카테고리 필터 아래에 스폰 장소 EN 토글 삽입
    if (filter.id === 'megaCategory') {
      sidebarEl.appendChild(_buildBiomeLangToggle());
    }
  });
}

/** 스폰 장소 한/영 표기 전환 버튼 */
function _buildBiomeLangToggle() {
  const wrap = document.createElement('section');
  wrap.className = 'filter-section';

  const heading = document.createElement('h3');
  heading.className = 'filter-section__title';
  heading.textContent = '스폰 장소 표기';
  wrap.appendChild(heading);

  const isEn = document.body.classList.contains('biome-lang-en');
  const btn = document.createElement('button');
  btn.id = 'biome-lang-toggle';
  btn.className = `chip${isEn ? ' chip--active' : ''}`;
  btn.type = 'button';
  btn.textContent = isEn ? '영문 표기 ON' : '영문 표기 OFF';
  btn.setAttribute('aria-pressed', String(isEn));

  btn.addEventListener('click', () => {
    const next = document.body.classList.toggle('biome-lang-en');
    btn.textContent = next ? '영문 표기 ON' : '영문 표기 OFF';
    btn.setAttribute('aria-pressed', String(next));
    btn.classList.toggle('chip--active', next);
  });

  wrap.appendChild(btn);
  return wrap;
}

/**
 * 필터 모듈에 맞는 컨트롤 DOM을 생성한다.
 * @param {import('../../core/filters/registry.js').FilterModule} filter
 * @returns {HTMLElement}
 */
function _buildControl(filter) {
  const value = getState().filterValues[filter.id] ?? filter.defaultValue;

  if (filter.uiType === 'chipGroup') {
    return _buildChipGroup(filter, value);
  }
  if (filter.uiType === 'switchGroup') {
    return _buildSwitchGroup(filter, value);
  }
  // fallback: toggle
  return _buildToggle({ id: filter.id, label: filter.label, value, onChange: (v) => setFilterValue(filter.id, v) });
}

/**
 * chipGroup (기본 포함, 클릭 → 제외 토글) — 메가 카테고리 / 지역 제외
 */
function _buildChipGroup(filter, value) {
  const wrap = document.createElement('div');
  wrap.className = 'chip-group';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', filter.label);

  filter.options.forEach((opt) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.dataset.optId = opt.id;
    chip.textContent = opt.label;

    // 값이 배열이면 포함 여부, 객체이면 키로 판단
    const isExcluded = Array.isArray(value)
      ? value.includes(opt.id)
      : value[opt.id] === true;

    if (isExcluded) chip.classList.add('chip--excluded');
    chip.setAttribute('aria-pressed', String(isExcluded));

    chip.addEventListener('click', () => {
      const cur = getState().filterValues[filter.id] ?? filter.defaultValue;
      let next;
      if (Array.isArray(cur)) {
        next = cur.includes(opt.id)
          ? cur.filter((x) => x !== opt.id)
          : [...cur, opt.id];
      } else {
        next = { ...cur, [opt.id]: !cur[opt.id] };
      }
      setFilterValue(filter.id, next);
      // 즉시 UI 동기화
      const excluded = Array.isArray(next) ? next.includes(opt.id) : next[opt.id];
      chip.classList.toggle('chip--excluded', excluded);
      chip.setAttribute('aria-pressed', String(excluded));
    });

    wrap.appendChild(chip);
  });

  return wrap;
}

/**
 * switchGroup — 진화 단계 On/Off 스위치들
 */
function _buildSwitchGroup(filter, value) {
  const wrap = document.createElement('div');
  wrap.className = 'switch-group';

  filter.options.forEach((opt) => {
    const label = document.createElement('label');
    label.className = 'switch-row';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'switch-input sr-only';
    input.checked = value[opt.id] ?? true;
    input.setAttribute('aria-label', opt.label);

    input.addEventListener('change', () => {
      const cur = getState().filterValues[filter.id] ?? filter.defaultValue;
      setFilterValue(filter.id, { ...cur, [opt.id]: input.checked });
    });

    const track = document.createElement('span');
    track.className = 'switch-track';
    track.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.className = 'switch-label-text';
    text.textContent = opt.label;

    label.append(input, track, text);
    wrap.appendChild(label);
  });

  return wrap;
}

/**
 * 단일 토글 스위치
 */
function _buildToggle({ id, label, value, onChange }) {
  const row = document.createElement('label');
  row.className = 'switch-row switch-row--standalone';
  row.htmlFor = `toggle-${id}`;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = `toggle-${id}`;
  input.className = 'switch-input sr-only';
  input.checked = value;
  input.addEventListener('change', () => onChange(input.checked));

  const track = document.createElement('span');
  track.className = 'switch-track';
  track.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'switch-label-text';
  text.textContent = label;

  row.append(input, track, text);
  return row;
}
