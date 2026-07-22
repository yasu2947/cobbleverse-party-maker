# API Client

## Summary

PokéAPI 저수준 fetch 레이어 + 세션 캐시. 모든 HTTP 요청의 단일 진입점.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| fetch + 캐시 | `src/api/pokeApiClient.js` | — | 구현 후 기재 |

## Reusable

| Export | File | Symbol | Lines | Used when |
|--------|------|--------|-------|-----------|
| fetchFromApi | `src/api/pokeApiClient.js` | `fetchFromApi` | — | 어느 모듈이든 PokéAPI 엔드포인트 호출 필요 시 |

## Reuse Pitfalls

- 직접 `fetch()`를 쓰지 말고 반드시 `fetchFromApi`를 통해 호출 — 캐시 우회 방지
- 레이트 리밋: 동시 요청 수 제한 확인

## Dependencies

- 브라우저 native `fetch`
- `IndexedDB` (선택적 영구 캐시)

## Notes

- 세션당 1회 전체 목록 fetch, 이후 메모리 캐시에서 제공
- 배치 요청으로 PokéAPI 레이트 리밋 준수

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
