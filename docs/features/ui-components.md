# UI Components

## Summary

DOM 렌더링 위젯 모음. `FilterPanel`, `PokemonCard`, `PartyGrid`, `PinSearch`, `TypeBalanceChart`, `render.js`.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| 필터 패널 | `src/ui/components/FilterPanel.js` | `FilterPanel` | 구현 후 기재 |
| 포켓몬 카드 | `src/ui/components/PokemonCard.js` | `PokemonCard` | 구현 후 기재 |
| 파티 그리드 | `src/ui/components/PartyGrid.js` | `PartyGrid` | 구현 후 기재 |
| 핀 검색 | `src/ui/components/PinSearch.js` | `PinSearch` | 구현 후 기재 |
| 타입 균형 차트 | `src/ui/components/TypeBalanceChart.js` | `TypeBalanceChart` | 구현 후 기재 |
| DOM 렌더링 | `src/ui/render.js` | `render` | 구현 후 기재 |

## Reusable

| Export | File | Symbol | Lines | Used when |
|--------|------|--------|-------|-----------|
| PokemonCard | `src/ui/components/PokemonCard.js` | `PokemonCard` | — | 포켓몬 1마리 카드 표시 필요 시 |

## Reuse Pitfalls

- `FilterPanel`은 레지스트리를 직접 읽어 렌더링 — 개별 필터를 import하지 않음
- 스타일은 `styles/` CSS 파일 참조 — 인라인 스타일 금지

## Dependencies

- `src/core/filters/registry.js` — `FilterPanel`이 사용
- `src/core/typeBalance.js` — `TypeBalanceChart`가 사용
- `src/state/store.js` — 상태 구독

## Notes

- 카드 전환: 플립 또는 페이드 애니메이션 (과도한 애니메이션 없음)
- 모바일 퍼스트: ~360px 폭까지 반응형
- 접근성: 타입 색상 외 충분한 대비, 키보드 탐색 가능

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
