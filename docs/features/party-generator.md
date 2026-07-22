# Party Generator

## Summary

후보 풀에서 포켓몬을 뽑고, 레지스트리의 활성 필터를 적용하고, 핀된 슬롯을 반영하며, 타입 균형 패스를 실행해 6마리 파티를 생성.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| 파티 생성 | `src/core/partyGenerator.js` | `generateParty` | 구현 후 기재 |

## Reusable

없음 (다른 모듈이 직접 import하지 않는다 — `store.js`를 통해 이벤트로 트리거).

## Reuse Pitfalls

- `generateParty` 호출 전 `getDataset()`이 완료 상태여야 함
- 핀 슬롯은 `pinManager.getPins()`에서 읽어야 함 — 직접 상태를 받지 않음

## Dependencies

- `src/api/dataset.js` — `getDataset`
- `src/core/filters/registry.js` — `getActiveFilters`
- `src/core/typeBalance.js` — `computeWeights`, `buildCoverageReport`
- `src/core/pinManager.js` — `getPins`

## Notes

- 메가 1슬롯 보장 필터가 활성화된 경우 별도 메가 풀에서 1개를 먼저 뽑은 후 나머지 5개를 일반 풀에서 뽑음

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
