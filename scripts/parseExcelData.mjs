/**
 * parseExcelData.mjs
 * Cobblemon_Spawn_Dex_KR + EN 엑셀 파일을 파싱해 spawnData.json 생성
 *
 * KR 파일: 한국어 장소·희귀도·조건·폼 (메인 표시용)
 * EN 파일: 영어 장소 (EN 토글용) + 영어 폼 문자열 (parseForms 파싱용)
 *
 * 실행: node scripts/parseExcelData.mjs
 */

import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KR_PATH = 'C:/Users/user/Downloads/Cobblemon_Spawn_Dex_KR_번역오류수정본.xlsx';
const EN_PATH = 'C:/Users/user/Downloads/Cobblemon_Spawn_Dex_EN.xlsx';
const OUT_PATH = path.join(__dirname, '../src/api/spawnData.json');

/* ─── 희귀도 정규화 (KR 값 → 통일 표기) ─── */
const RARITY_NORM = {
  '매우 희귀': '매우 희귀함',
  '매우 희귀함': '매우 희귀함',
  '흔치 않음': '흔치않음',
  '흔치않음': '흔치않음',
  '흔함': '흔함',
  '희귀': '희귀함',
  '희귀함': '희귀함',
  '전설': '전설',
  '흔치않음/희귀함': '흔치않음/희귀함',
  '희귀/흔치않음': '희귀/흔치않음',
  '흔치 않음/희귀': '흔치않음/희귀함',
  '희귀/흔치 않음': '희귀/흔치않음',
};

/** PokéAPI 슬러그 형식으로 정규화 */
function toKey(name) {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cell(ws, row, col) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col - 1 });
  const v = ws[addr];
  return v ? String(v.v).trim() : '';
}

/* ─── 파일 읽기 ─── */
console.log('Reading KR file...');
const wbKR = XLSX.readFile(KR_PATH);
const wsKR = wbKR.Sheets[wbKR.SheetNames[0]];
const rangeKR = XLSX.utils.decode_range(wsKR['!ref']);

console.log('Reading EN file...');
const wbEN = XLSX.readFile(EN_PATH);
const wsEN = wbEN.Sheets[wbEN.SheetNames[0]];

const result = {};
let skipped = 0;

for (let r = 1; r <= rangeKR.e.r; r++) {
  // KR 컬럼: 1=번호 2=한국명 3=영어명 4=출처 5=장소 6=희귀도 7=조건 8=폼/비고
  const enName = cell(wsKR, r + 1, 3);
  if (!enName) { skipped++; continue; }

  const key = toKey(enName);

  // KR 컬럼: 5=서식지 6=희귀도 7=조건 8=폼/비고
  const spawnKR   = cell(wsKR, r + 1, 5);
  const rarityRaw = cell(wsKR, r + 1, 6);
  const condKR    = cell(wsKR, r + 1, 7);
  const formsKR   = cell(wsKR, r + 1, 8);

  // EN 컬럼: 4=Spawn Location 5=Rarity 6=Condition 7=Forms/Notes
  const spawnEN     = cell(wsEN, r + 1, 4);
  const condEN      = cell(wsEN, r + 1, 6);
  const formsEN     = cell(wsEN, r + 1, 7);

  const rarity = RARITY_NORM[rarityRaw] ?? rarityRaw;

  if (!key) { skipped++; continue; }

  result[key] = {
    spawn:       spawnKR,    // KR 서식지 (한글 표시용)
    spawnEn:     spawnEN,    // EN 서식지 (영문 표시용)
    rarity,
    condition:   condKR,    // KR 조건
    conditionEn: condEN,    // EN 조건
    formsKR,                // KR 폼/비고 (한글 직접 표시)
    forms:       formsEN,   // EN Forms/Notes (영문 직접 표시)
  };
}

/* ─── 출력 ─── */
writeFileSync(OUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
console.log(`Done: ${Object.keys(result).length} entries written to ${OUT_PATH}`);
if (skipped) console.log(`Skipped: ${skipped} empty rows`);

/* 품질 체크 샘플 */
const samples = ['pikachu', 'meowth', 'raichu', 'decidueye', 'zorua'];
console.log('\n=== Samples ===');
for (const k of samples) {
  if (result[k]) {
    const e = result[k];
    console.log(`[${k}] spawn=${e.spawn.slice(0,40)} | condEN=${(e.conditionEn||'').slice(0,30)} | formsKR=${(e.formsKR||'').slice(0,50)}`);
  }
}
