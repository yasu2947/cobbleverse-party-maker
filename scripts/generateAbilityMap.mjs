/**
 * generateAbilityMap.mjs
 * PokéAPI에서 모든 특성의 한국어 이름을 가져와 abilityMap.json 생성
 * 실행: node scripts/generateAbilityMap.mjs
 */

import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../src/api/abilityMap.json');
const BASE_URL = 'https://pokeapi.co/api/v2';

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, (r) => {
      let data = '';
      r.on('data', (c) => (data += c));
      r.on('end', () => {
        try { res(JSON.parse(data)); }
        catch(e) { rej(new Error(`JSON parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', rej);
  });
}

async function fetchBatch(urls, concurrency = 20) {
  const results = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(get));
    results.push(...batchResults);
    process.stdout.write(`\r  ${Math.min(i + concurrency, urls.length)} / ${urls.length}`);
  }
  console.log();
  return results;
}

async function main() {
  console.log('특성 목록 가져오는 중...');
  const list = await get(`${BASE_URL}/ability?limit=500`);
  const urls = list.results.map((r) => r.url);
  console.log(`총 ${urls.length}개 특성 조회 중...`);

  const details = await fetchBatch(urls, 20);

  const map = {};
  for (const d of details) {
    const slug = d.name;
    const koName = d.names?.find((n) => n.language.name === 'ko')?.name;
    const enName = d.names?.find((n) => n.language.name === 'en')?.name
      ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    map[slug] = koName ?? enName;
  }

  writeFileSync(OUT_PATH, JSON.stringify(map, null, 2), 'utf-8');
  console.log(`완료: ${Object.keys(map).length}개 특성 → ${OUT_PATH}`);
  console.log('샘플:', { overgrow: map.overgrow, blaze: map.blaze, torrent: map.torrent, intimidate: map.intimidate });
}

main().catch(console.error);
