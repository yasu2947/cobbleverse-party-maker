/**
 * 중앙 상태 스토어 — pub/sub 패턴
 * 상태 슬라이스: filters, filterValues, pins, party, coverageReport, loading
 */

/** @typedef {{ [filterId: string]: any }} FilterValues */
/** @typedef {import('../api/dataset.js').PokemonEntry[]} Party */

const initialState = {
  /** 로딩 상태 */
  loading: true,
  loadingProgress: 0,
  loadingStatus: '포켓몬 데이터를 불러오는 중...',

  /** 필터 값 (filterId → value) */
  filterValues: {},

  /** 핀된 포켓몬 (슬롯 인덱스 0–5 → PokemonEntry | null) */
  pins: [null, null, null, null, null, null],

  /** 현재 파티 (6개, null = 빈 슬롯) */
  party: [null, null, null, null, null, null],

  /** 방어 매치업 리포트 */
  coverageReport: null,
};

let _state = { ...initialState };

/** @type {Map<string, Set<Function>>} */
const _listeners = new Map();

/**
 * 현재 상태의 얕은 복사본을 반환한다.
 * @returns {typeof initialState}
 */
export function getState() {
  return { ..._state };
}

/**
 * 상태를 부분 업데이트한다. 구독자에게 변경된 키를 알린다.
 * @param {Partial<typeof initialState>} patch
 */
export function dispatch(patch) {
  const prev = _state;
  _state = { ...prev, ...patch };

  const changedKeys = Object.keys(patch);
  changedKeys.forEach((key) => {
    const keyListeners = _listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((fn) => fn(_state[key], prev[key]));
    }
  });

  // '*' 구독자는 모든 변경에 응답
  const globalListeners = _listeners.get('*');
  if (globalListeners) {
    globalListeners.forEach((fn) => fn(_state, prev));
  }
}

/**
 * 특정 상태 키의 변경을 구독한다.
 * @param {string} key - 상태 키, 또는 '*'(모든 변경)
 * @param {Function} fn - 콜백 (newValue, prevValue)
 * @returns {() => void} 구독 해제 함수
 */
export function subscribe(key, fn) {
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key).add(fn);
  return () => _listeners.get(key).delete(fn);
}

/**
 * filterValues 내 특정 필터의 값만 업데이트한다.
 * @param {string} filterId
 * @param {any} value
 */
export function setFilterValue(filterId, value) {
  dispatch({
    filterValues: { ..._state.filterValues, [filterId]: value },
  });
}
