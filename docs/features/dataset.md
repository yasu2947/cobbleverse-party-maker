# Dataset

## Summary

PokéAPI에서 전체 포켓몬 풀을 1회 빌드·정규화하고, `patches/megaZ.patch.json`을 병합하는 모듈.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| 풀 빌드·정규화 | `src/api/dataset.js` | `buildDataset` | 구현 후 기재 |
| Z 메가진화 패치 데이터 | `src/api/patches/megaZ.patch.json` | — | — |

## Reusable

| Export | File | Symbol | Lines | Used when |
|--------|------|--------|-------|-----------|
| getDataset | `src/api/dataset.js` | `getDataset` | — | 정규화된 포켓몬 풀 전체가 필요할 때 |

## Reuse Pitfalls

- `buildDataset()`은 앱 초기화 시 1회만 호출. 이후는 `getDataset()`으로 캐시된 풀 반환.
- Z 메가진화가 풀에 없으면 `megaZ.patch.json` 내용 확인 — [troubleshooting.md](../troubleshooting.md) 참조

## Dependencies

- `src/api/pokeApiClient.js` — `fetchFromApi`
- `src/api/patches/megaZ.patch.json`

## Notes

- 각 포켓몬 항목의 정규화 스키마는 [architecture/naming_convention.md](../architecture/naming_convention.md) 참조
- Z 메가진화 패치는 API와 동일 스키마 — API 지원 시 패치 파일 삭제 + merge 줄 제거

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
