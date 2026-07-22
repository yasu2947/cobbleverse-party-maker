# State Store

## Summary

앱 전역 상태 (필터 값, 핀, 현재 파티)를 관리하는 중앙 pub/sub 스토어.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| 중앙 상태 | `src/state/store.js` | `createStore`, `subscribe`, `dispatch` | 구현 후 기재 |

## Reusable

| Export | File | Symbol | Lines | Used when |
|--------|------|--------|-------|-----------|
| subscribe | `src/state/store.js` | `subscribe` | — | UI가 상태 변화를 구독할 때 |
| dispatch | `src/state/store.js` | `dispatch` | — | 상태를 변경해야 할 때 |

## Reuse Pitfalls

- UI 컴포넌트는 `dispatch`로만 상태 변경 — 직접 mutate 금지
- fetch 로직(`api/`)은 store에 의존하지 않음

## Dependencies

없음 (최하위 레이어)

## Notes

- 상태 슬라이스: `filters`, `pins`, `party`, `coverageReport`, `loading`

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
