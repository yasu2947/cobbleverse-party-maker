/**
 * Cobbleverse 스폰 데이터 파싱 스크립트
 * 실행: node scripts/parseSpawnData.mjs
 * 출력: src/api/spawnData.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT  = 'C:\\Users\\user\\.cursor\\projects\\c-Users-user-OneDrive\\agent-tools\\cd6ac6af-3a52-4aa1-8333-d598f0d06af4.txt';
const OUTPUT = path.resolve(__dirname, '../src/api/spawnData.json');

const raw = fs.readFileSync(INPUT, 'utf-8');
const lines = raw.split('\n');

// 테이블 행 파싱: | #N | Name | Source | Spawn | Rarity | Condition | Forms |
// **Name** 볼드 또는 일반 Name 모두 처리
const ROW_RE = /^\|\s*#(\d+)\s*\|\s*\*{0,2}([^|*]+?)\*{0,2}\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/;

const entries = {};

for (const line of lines) {
  const m = line.match(ROW_RE);
  if (!m) continue;

  const [, num, name, , spawn, rarity, condition, forms] = m.map(s => s.trim());

  // 마크다운 강조 제거
  const clean = s => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  entries[key] = {
    num: parseInt(num),
    name,
    spawn:     clean(spawn),
    rarity:    clean(rarity),
    condition: clean(condition),
    forms:     clean(forms),
  };
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(entries, null, 2), 'utf-8');
console.log(`✓ ${Object.keys(entries).length}개 항목 → ${OUTPUT}`);
