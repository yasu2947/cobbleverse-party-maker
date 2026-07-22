# Pin Manager

## Summary

핀/언핀 상태 관리. 최대 5개 슬롯, 슬롯 매핑, 유효성 검증.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| 핀 상태 관리 | `src/core/pinManager.js` | `pinPokemon`, `unpinPokemon`, `getPins` | 구현 후 기재 |

## Reusable

| Export | File | Symbol | Lines | Used when |
|--------|------|--------|-------|-----------|
| getPins | `src/core/pinManager.js` | `getPins` | — | 파티 생성 시 핀 슬롯 조회 |

## Reuse Pitfalls

- 최대 5개 핀 제한: `pinPokemon` 호출 전 현재 핀 수 확인 필요
- 재롤 시 핀된 슬롯은 절대 교체하지 않음

## Dependencies

- `src/state/store.js` — 핀 상태 저장

## Notes

- 핀 슬롯은 0–4 인덱스로 관리 (총 6슬롯 중 핀 최대 5개)

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
