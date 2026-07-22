# 네이밍 규칙 (Naming Convention)

> 스택: 바닐라 JavaScript (ES Modules)

---

## 파일·디렉토리

| 대상 | 규칙 | 예시 |
|------|------|------|
| JS 모듈 (유틸·서비스) | `camelCase.js` | `pokeApiClient.js`, `dataset.js` |
| 필터 모듈 | `camelCase.filter.js` | `regionExclusion.filter.js` |
| UI 컴포넌트 | `PascalCase.js` | `PokemonCard.js`, `FilterPanel.js` |
| CSS 파일 | `kebab-case.css` | `variables.css`, `components.css` |
| JSON 데이터 패치 | `camelCase.patch.json` | `megaZ.patch.json` |
| 디렉토리 | `kebab-case` 또는 소문자 단어 | `filters/`, `components/`, `patches/` |
| HTML | `kebab-case.html` | `index.html` |

---

## 식별자 (코드 내)

| 대상 | 규칙 | 예시 |
|------|------|------|
| 함수·메서드 | `camelCase` | `fetchPokemon`, `registerFilter` |
| 변수·상수 (단일 값) | `camelCase` | `currentParty`, `activeFilters` |
| 상수 (컬렉션·고정값) | `SCREAMING_SNAKE_CASE` | `REGIONS`, `TYPE_COLORS`, `MAX_PINS` |
| 클래스 | `PascalCase` | `PinManager`, `PartyGenerator` |
| 필터 ID | `camelCase` 문자열 | `"regionExclusion"`, `"evolutionStage"` |

---

## 데이터 모델 필드

포켓몬 정규화 항목은 다음 필드명 사용 (camelCase):

```js
{
  id: Number,
  name: String,          // API 슬러그 (예: "charizard-mega-x")
  displayName: String,   // 표시용 이름 (예: "Mega Charizard X")
  types: String[],       // 예: ["fire", "flying"]
  generation: Number,    // 1–9
  region: String,        // 예: "kanto"
  isLegendary: Boolean,
  isMythical: Boolean,
  isMega: Boolean,
  isBaby: Boolean,
  evolutionStage: String, // "basic" | "stage1" | "stage2" | "final"
  formType: String,       // "standard" | "regional" | "mega" | "mega-z"
  canZMove: Boolean,
  spriteUrl: String,
}
```

---

## 언어 정책

| 대상 | 언어 |
|------|------|
| 식별자·함수·클래스·변수 | **영어** |
| 코드 주석 | **한국어** |
| 유저 대면 UI 문자열 | **한국어** |
| 문서 (`docs/`) 본문 | **한국어** (경로·심볼은 영어) |
| `AGENTS.md` | **영어** |
| `prd.md` | **영어** |
