# Plan — 풀 정리 + 획득 데이터 누락 수정

Status: **done** (카드 인라인 스폰 정보, 획득 탭 제거, EN 토글 포함)  
Created: 2026-07-22  
Approved: (명시적 요청)

## Goal

1. 지역 폼(알로라/가라르/히스이/팔데아)·거다이맥스 → 풀에서 제외 (기본 개체와 동일 취급)
2. 메가 폼 표시명 수정 → "메가 {이름} [X/Y/Z]"
3. `aegislash-shield` 등 폼 접미사로 인한 스폰 데이터 누락 수정 (점진적 키 검색)
4. BIOME_MAP "All X biomes" → "모든 X 바이옴" 통일

## Changes

| File | Action |
|------|--------|
| `src/api/dataset.js` | gmax 폼 타입 추가, 메가 displayName 수정, 지역·gmax 풀 제외 |
| `src/api/spawnLookup.js` | getSpawnInfo 점진적 키 검색 폴백 |
| `src/api/spawnTranslations.js` | BIOME_MAP "All X biomes" → "바이옴" 표현 통일 |
| `src/api/patches/megaZ.patch.json` | displayName 형식 수정 |
