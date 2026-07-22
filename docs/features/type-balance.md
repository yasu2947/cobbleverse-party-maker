# Type Balance

## Summary

타입 균형 가중치 계산 + 파티 완성 후 타입 커버리지 리포트 생성.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| 균형 가중치 | `src/core/typeBalance.js` | `computeWeights` | 구현 후 기재 |
| 커버리지 리포트 | `src/core/typeBalance.js` | `buildCoverageReport` | 구현 후 기재 |

## Reusable

| Export | File | Symbol | Lines | Used when |
|--------|------|--------|-------|-----------|
| computeWeights | `src/core/typeBalance.js` | `computeWeights` | — | 파티 생성 중 후보 가중치 필요 시 |
| buildCoverageReport | `src/core/typeBalance.js` | `buildCoverageReport` | — | 파티 완성 후 커버리지 표시 시 |

## Reuse Pitfalls

- 핀된 포켓몬의 타입을 먼저 계산에 반영한 뒤 나머지 슬롯에 균형 적용
- 18타입 차트 기준 — PokéAPI/Bulbapedia 컨벤션 준수

## Dependencies

없음 (순수 함수 모듈)

## Notes

- 커버리지 리포트: 각 타입 출현 수, 공통 약점 중복 점수 포함
- `TypeBalanceChart.js`가 리포트를 소비해 차트 렌더링

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
