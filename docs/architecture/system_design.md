# 시스템 설계 (System Design)

> 출처: `pokemon-random-party-maker-prd.md` Section 8

---

## 스택

| 항목 | 선택 |
|------|------|
| 타입 | 단일 페이지 웹 앱 (SPA) |
| 빌드 | Vite (권장) 또는 No-build 바닐라 ESM |
| 언어 | 모던 JavaScript (ES2020+, ES Modules) |
| 프레임워크 | 바닐라 JS 권장 (React도 허용, PRD는 모듈성 요구) |
| 스타일 | Plain CSS (CSS 커스텀 프로퍼티 / 변수) |
| 데이터 소스 | PokéAPI REST (`https://pokeapi.co`) |
| 이미지 | PokéAPI 제공 URL (로컬 저장 없음) |
| 캐시 | 메모리 + IndexedDB (선택) |

---

## 디렉토리 구조

```
pokemon-random-party-maker/
  index.html                    — HTML 진입점 (단일 파일 허용)
  src/
    main.js                     — 앱 부트스트랩 / 초기화
    api/
      pokeApiClient.js          — PokéAPI 저수준 fetch + 캐시
      dataset.js                — 전체 포켓몬 풀 빌드·정규화 (1회 실행)
      patches/
        megaZ.patch.json        — Z 메가진화 수동 오버라이드 데이터
                                   (API가 지원하면 삭제 — 코드 변경 없음)
    core/
      filters/                  — 필터 1파일 = 1필터, 자기 등록
        registry.js             — registerFilter() / getActiveFilters() 노출
        regionExclusion.filter.js
        evolutionStage.filter.js
        megaCategory.filter.js
      partyGenerator.js         — 후보 추출, 필터 적용, 핀 반영, typeBalance 호출
      typeBalance.js            — 균형 가중치 + 커버리지 리포트
      pinManager.js             — 핀/언핀 상태, 최대 5, 슬롯 매핑
    ui/
      components/               — UI 위젯 1파일 = 1컴포넌트
        FilterPanel.js          — 레지스트리의 필터 렌더링
        PokemonCard.js
        PartyGrid.js
        PinSearch.js
        TypeBalanceChart.js
      render.js                 — DOM 렌더링 / 상태 바인딩
    state/
      store.js                  — 중앙 앱 상태 (pub/sub 또는 신호)
  styles/
    variables.css               — 디자인 토큰, 타입 색상 맵
    base.css
    components.css
docs/
  index.md
  requirements.md
  architecture/
    system_design.md            — 이 파일
    naming_convention.md
  features/
  troubleshooting.md
  plan.md
  archive/
```

---

## 핵심 설계 원칙

### 필터 레지스트리 패턴

모든 필터는 공통 인터페이스를 노출하는 독립 모듈:

```js
// 예시: core/filters/regionExclusion.filter.js
export default {
  id: "regionExclusion",
  label: "Exclude legendaries by region",
  uiType: "multiSelect",
  options: REGIONS,
  defaultValue: [],
  predicate: (pokemon, value) =>
    !(pokemon.isLegendary && value.includes(pokemon.region)),
};
```

- `registry.js`가 필터를 수집하고 `FilterPanel.js`(UI)와 `partyGenerator.js`(로직) 양쪽에 제공.
- **필터 추가** = `*.filter.js` 파일 생성 + 레지스트리 import 1줄. 다른 파일 수정 없음.
- **필터 제거** = 파일 삭제 + import 줄 삭제.

### 데이터 갭 처리 (Z 메가진화)

`dataset.js`가 로드 시 `patches/megaZ.patch.json`을 정규화된 풀에 병합.  
API에서 공식 지원되면 패치 파일 1개 삭제 + merge 줄 1개 제거 — 필터·UI 코드 변경 없음.

### 분리 원칙

| 레이어 | 책임 |
|--------|------|
| `api/` | 네트워크 fetch, 캐시, 데이터 정규화 |
| `core/` | 비즈니스 로직 (필터링, 랜덤화, 균형) |
| `ui/` | DOM 렌더링, 이벤트 바인딩 |
| `state/` | 전역 상태, pub/sub |

각 레이어는 인접 레이어와 직접 결합하지 않는다.

---

## 성능 목표

- 데이터셋 로드 후 파티 생성 < 100ms
- 초기 fetch는 1회만, 이후 캐시에서 제공
- 배치 요청으로 PokéAPI 레이트 리밋 준수
