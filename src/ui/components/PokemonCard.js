/**
 * PokemonCard — 포켓몬 카드 DOM 생성
 * 스프라이트, 이름, 타입, 특성, 종족값, 스폰 정보 포함.
 */

import { TYPE_MAP } from '../../core/constants/types.js';
import { getSpawnInfo } from '../../api/spawnLookup.js';
import abilityMap from '../../api/abilityMap.json' assert { type: 'json' };

/** 희귀도(KR) → CSS 수식어 */
const RARITY_MOD = {
  '흔함':            'common',
  '흔치않음':        'uncommon',
  '흔치않음/희귀함': 'uncommon',
  '희귀함':          'rare',
  '희귀/흔치않음':   'rare',
  '매우 희귀함':     'ultra',
  '전설':            'legendary',
};

/** 종족값 슬러그 → 한국어 약칭 */
const STAT_LABEL = {
  'hp':              'HP',
  'attack':          '공격',
  'defense':         '방어',
  'special-attack':  '특공',
  'special-defense': '특방',
  'speed':           '스피드',
};

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const STAT_MAX = 255; // 최대 종족값 참조치

/** 특성 slug → 한국어 이름 */
function abilityName(slug) {
  return abilityMap[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** 특성 목록 HTML 생성 (일반 1~2개 + 숨겨진 특성) */
function buildAbilitiesHtml(abilities, isMegaZ) {
  if (isMegaZ) return '<span class="card__ability card__ability--unknown">특성 정보 없음</span>';
  if (!abilities?.length) return '';

  const normal = abilities.filter((a) => !a.isHidden);
  const hidden = abilities.filter((a) => a.isHidden);

  const normalHtml = normal.map((a) =>
    `<span class="card__ability">${abilityName(a.name)}</span>`
  ).join('<span class="card__ability-sep">·</span>');

  const hiddenHtml = hidden.map((a) =>
    `<span class="card__ability card__ability--hidden">
       <span class="card__ability-tag">숨</span>${abilityName(a.name)}
     </span>`
  ).join('');

  return `<div class="card__ability-row">${normalHtml}</div>${hiddenHtml ? `<div class="card__ability-row card__ability-row--hidden">${hiddenHtml}</div>` : ''}`;
}

/** 종족값 숫자 + 미니 바 2열 그리드 + 합계 */
function buildStatsHtml(stats) {
  if (!stats || !Object.keys(stats).length) return '';

  const pairs = [
    ['hp',      'special-attack'],
    ['attack',  'special-defense'],
    ['defense', 'speed'],
  ];

  function statCls(v) {
    return v >= 110 ? 'ex' : v >= 80 ? 'high' : v >= 55 ? 'mid' : 'low';
  }

  /* 각 행: 2개의 stat-half (각각 [라벨|숫자|바]) */
  const rows = pairs.map(([a, b]) => {
    const va = stats[a] ?? 0, vb = stats[b] ?? 0;
    const pa = Math.round((va / 255) * 100), pb = Math.round((vb / 255) * 100);
    return `
      <div class="stat-row">
        <div class="stat-half">
          <span class="stat-lbl">${STAT_LABEL[a]}</span>
          <span class="stat-num">${va}</span>
          <div class="stat-mini-bg"><div class="stat-mini stat-mini--${statCls(va)}" style="width:${pa}%"></div></div>
        </div>
        <div class="stat-half">
          <span class="stat-lbl">${STAT_LABEL[b]}</span>
          <span class="stat-num">${vb}</span>
          <div class="stat-mini-bg"><div class="stat-mini stat-mini--${statCls(vb)}" style="width:${pb}%"></div></div>
        </div>
      </div>
    `;
  }).join('');

  const total = STAT_ORDER.reduce((s, k) => s + (stats[k] ?? 0), 0);
  return `
    <div class="stat-total">
      <span class="stat-total__label">합계</span>
      <strong class="stat-total__num">${total}</strong>
    </div>
    <div class="stat-rows">${rows}</div>
  `;
}

/**
 * @param {import('../../api/dataset.js').PokemonEntry} pokemon
 * @param {object} opts
 */
export function createPokemonCard(pokemon, { isPinned, slotIndex, onPin, onRemove, onClick }) {
  const { biome, biomeRaw, rarity, condition, conditionEn, formNote } = getSpawnInfo(pokemon);
  const mod = RARITY_MOD[rarity] ?? 'common';

  const card = document.createElement('li');
  card.className = `pokemon-card${isPinned ? ' pokemon-card--pinned' : ''}`;
  card.setAttribute('role', 'listitem');
  card.draggable = true;
  card.dataset.slot = slotIndex;
  card.dataset.name = pokemon.name;

  const primaryType   = pokemon.types[0] ?? 'normal';
  const secondaryType = pokemon.types[1] ?? primaryType;
  const isDual = pokemon.types.length > 1;
  card.style.setProperty('--card-type-color',   `var(--type-${primaryType})`);
  card.style.setProperty('--card-type-color-2', `var(--type-${secondaryType})`);
  if (isDual) card.dataset.dual = 'true';

  const isMegaZ = pokemon.formType === 'mega-z';
  const hasGmax  = !!pokemon.gmaxSpriteUrl;
  const hasShiny = !!pokemon.spriteUrlShiny;

  const dexNo = `#${String(pokemon.id).padStart(4, '0')}`;

  card.innerHTML = `
    <div class="card__type-panel" aria-hidden="true"></div>
    <button class="card__remove-btn" aria-label="${pokemon.displayName} 제거" data-action="remove">✕</button>

    <!-- 타입 패널 영역 래퍼 (핀=좌상단, 이로치/Gmax=우하단) -->
    <div class="card__left">
      <button class="card__pin-btn${isPinned ? ' card__pin-btn--active' : ''}"
              aria-label="${isPinned ? '핀 해제' : '핀 고정'}" aria-pressed="${isPinned}"
              data-action="pin">📌</button>

      <div class="card__sprite-wrap">
        <div class="card__pokeball" aria-hidden="true"></div>
        ${pokemon.spriteUrl
          ? `<img src="${pokemon.spriteUrl}" alt="${pokemon.displayName} 스프라이트" class="card__sprite"
                 data-base="${pokemon.spriteUrl}"
                 data-shiny="${pokemon.spriteUrlShiny}"
                 data-gmax="${pokemon.gmaxSpriteUrl}"
                 loading="lazy"
                 onerror="this.style.display='none'" />`
          : `<div class="card__sprite-placeholder" aria-label="스프라이트 자리">◎</div>`
        }
        ${pokemon.isMega
          ? `<span class="card__mega-badge">${pokemon.formType === 'mega-z' ? 'Z' : 'M'}</span>`
          : ''
        }
        <span class="card__dex-no">${dexNo}</span>
      </div>

      <div class="card__info">
        <p class="card__name">
          ${pokemon.displayName}
          ${formNote ? `<span class="card__form-tag">${formNote}</span>` : ''}
        </p>
        <div class="card__types" role="list" aria-label="타입">
          ${pokemon.types.map((t) => `
            <span class="type-badge type-badge--${t}" role="listitem" style="--badge-color:var(--type-${t})">
              ${TYPE_MAP[t]?.label ?? t}
            </span>
          `).join('')}
        </div>
        <div class="card__abilities">
          ${buildAbilitiesHtml(pokemon.abilities, isMegaZ)}
        </div>
      </div>

      <!-- Gmax 왼쪽, 이로치 오른쪽 — 타입 패널 우하단 -->
      <div class="card__action-btns">
        ${hasGmax  ? `<button class="card__toggle-btn card__toggle-btn--gmax" data-action="gmax" title="거다이맥스" aria-label="거다이맥스 전환">G</button>` : ''}
        ${hasShiny ? `<button class="card__toggle-btn" data-action="shiny" title="이로치" aria-label="이로치 전환">✨</button>` : ''}
      </div>
    </div>

    <div class="card__right">
      <div class="card__stats" aria-label="종족값">
        ${buildStatsHtml(pokemon.stats)}
      </div>
      <div class="card__acq-inline" aria-label="획득 정보">
        <span class="card__acq-biome biome-ko">${biome}</span>
        <span class="card__acq-biome biome-en">${biomeRaw}</span>
        <div class="card__acq-bottom">
          ${rarity !== '—' ? `<span class="rarity-badge rarity-badge--${mod} rarity-badge--xs">${rarity}</span>` : ''}
          ${condition   ? `<span class="card__acq-cond biome-ko">${condition}</span>`   : ''}
          ${conditionEn ? `<span class="card__acq-cond biome-en">${conditionEn}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  // ── 이벤트 ──
  card.querySelector('[data-action="remove"]').addEventListener('click', (e) => {
    e.stopPropagation();
    onRemove(slotIndex);
  });
  card.querySelector('[data-action="pin"]').addEventListener('click', (e) => {
    e.stopPropagation();
    onPin(slotIndex);
  });
  card.addEventListener('click', () => onClick(slotIndex));

  // 이로치 토글
  card.querySelector('[data-action="shiny"]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const img = card.querySelector('.card__sprite');
    if (!img) return;
    const btn = e.currentTarget;
    const isShiny = btn.classList.toggle('card__toggle-btn--active');
    // Gmax 상태도 고려
    const isGmax = card.querySelector('[data-action="gmax"]')?.classList.contains('card__toggle-btn--active');
    img.src = isShiny
      ? (img.dataset.shiny || img.dataset.base)
      : (isGmax && img.dataset.gmax ? img.dataset.gmax : img.dataset.base);
  });

  // 거다이맥스 토글
  card.querySelector('[data-action="gmax"]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const img = card.querySelector('.card__sprite');
    if (!img) return;
    const btn = e.currentTarget;
    const isGmax = btn.classList.toggle('card__toggle-btn--active');
    const isShiny = card.querySelector('[data-action="shiny"]')?.classList.contains('card__toggle-btn--active');
    img.src = isGmax
      ? (img.dataset.gmax || img.dataset.base)
      : (isShiny && img.dataset.shiny ? img.dataset.shiny : img.dataset.base);
  });

  return card;
}

/**
 * 빈 슬롯 플레이스홀더 DOM 생성.
 */
export function createEmptySlot(slotIndex, onClick) {
  const li = document.createElement('li');
  li.className = 'pokemon-card pokemon-card--empty';
  li.setAttribute('role', 'listitem');
  li.draggable = false;
  li.dataset.slot = slotIndex;

  li.innerHTML = `
    <button class="empty-slot__btn" aria-label="슬롯 ${slotIndex + 1} — 클릭하여 포켓몬 선택">
      <span class="empty-slot__icon" aria-hidden="true">＋</span>
      <span class="empty-slot__label">슬롯 ${slotIndex + 1}</span>
    </button>
  `;

  li.querySelector('button').addEventListener('click', () => onClick(slotIndex));
  return li;
}
