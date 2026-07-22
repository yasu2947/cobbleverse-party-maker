# Troubleshooting

> 기능 doc의 **Reuse Pitfalls**에서 교차 기능 실패 사례를 여기에 링크한다.

## 형식

```markdown
## [짧은 제목]

**증상:** …
**원인:** …
**해결:** …
**관련:** `path/file.js` — `symbol` (L10–L40) | [features/xxx.md](features/xxx.md)
```

관련 소스 파일이 있으면 반드시 **심볼 + 줄 범위** 포함.

---

## 항목

<!-- 아래에 항목 추가 -->

## Z 메가진화 데이터 미지원

**증상:** Z 메가진화 (예: Mega Lucario Z) 포켓몬이 풀에 나타나지 않음  
**원인:** PokéAPI 공개 데이터셋이 아직 해당 항목을 포함하지 않음  
**해결:** `src/api/patches/megaZ.patch.json`에 항목 추가. API가 지원되면 패치 파일 삭제 + `dataset.js`의 merge 줄 1개 제거  
**관련:** `src/api/dataset.js` — `buildDataset` | [features/dataset.md](features/dataset.md)
