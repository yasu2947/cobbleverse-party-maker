# Filters

## Summary

필터 레지스트리 패턴. 각 필터는 독립 파일로 공통 인터페이스를 노출. `FilterPanel.js`와 `partyGenerator.js` 모두 레지스트리만 참조.

## Code Map

| Role | File | Symbol | Lines |
|------|------|--------|-------|
| 필터 등록·조회 | `src/core/filters/registry.js` | `registerFilter`, `getActiveFilters` | 구현 후 기재 |
| 지역별 전설 제외 | `src/core/filters/regionExclusion.filter.js` | default export | 구현 후 기재 |
| 진화 단계 | `src/core/filters/evolutionStage.filter.js` | default export | 구현 후 기재 |
| 메가 카테고리 | `src/core/filters/megaCategory.filter.js` | default export | 구현 후 기재 |

## 필터 인터페이스

```js
{
  id: String,           // camelCase 고유 ID
  label: String,        // UI 표시 레이블
  uiType: String,       // "toggle" | "multiSelect" | "checkbox"
  options: Array,       // uiType이 multiSelect/checkbox일 때
  defaultValue: Any,
  predicate: (pokemon, value) => Boolean,
}
```

## Reusable

| Export | File | Symbol | Lines | Used when |
|--------|------|--------|-------|-----------|
| getActiveFilters | `src/core/filters/registry.js` | `getActiveFilters` | — | 파티 생성 시 필터 목록 필요 시 |
| registerFilter | `src/core/filters/registry.js` | `registerFilter` | — | 새 필터 모듈을 추가할 때 |

## Reuse Pitfalls

- 새 필터 추가: `*.filter.js` 파일 생성 + `registry.js`에 import 1줄 — 다른 파일 수정 없음
- `predicate`는 순수 함수여야 함 (부작용 없음)

## Dependencies

- `src/core/filters/registry.js` ← 각 `*.filter.js` 파일들

## Notes

- 필터 제거: 파일 삭제 + registry.js import 줄 삭제만으로 충분
- `FilterPanel.js`는 레지스트리로부터 필터 목록을 읽어 렌더링하므로 UI 코드 수정 불필요

## Change Log

- 2026-07-21: 초기 문서 생성 (bootstrap)
