/**
 * PokéAPI 저수준 fetch 레이어 + 인메모리 캐시
 * 모든 네트워크 호출은 이 모듈을 통해야 한다.
 */

const BASE_URL = 'https://pokeapi.co/api/v2';

/** @type {Map<string, any>} */
const _cache = new Map();

/**
 * PokéAPI 엔드포인트에 GET 요청을 보낸다. 결과를 캐시한다.
 * @param {string} path - '/pokemon/1' 같은 경로 또는 절대 URL
 * @returns {Promise<any>}
 */
export async function fetchFromApi(path) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  if (_cache.has(url)) return _cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokéAPI 오류: ${res.status} ${url}`);
  const data = await res.json();
  _cache.set(url, data);
  return data;
}

/**
 * 여러 URL을 동시에 fetch한다. concurrency 제한으로 레이트 리밋 방지.
 * @param {string[]} urls
 * @param {{ concurrency?: number, onProgress?: (done: number, total: number) => void }} opts
 * @returns {Promise<any[]>}
 */
export async function fetchBatch(urls, { concurrency = 20, onProgress } = {}) {
  const results = new Array(urls.length);
  let done = 0;

  // concurrency 단위로 청크 분할
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((url) => fetchFromApi(url)));
    chunkResults.forEach((r, j) => { results[i + j] = r; });
    done += chunk.length;
    onProgress?.(done, urls.length);
  }

  return results;
}

/**
 * 캐시를 비운다 (테스트·개발용).
 */
export function clearCache() {
  _cache.clear();
}

/**
 * 페이지네이션된 PokéAPI 목록 전체를 한 번에 가져온다.
 * @param {string} path - '/pokemon?limit=100' 등
 * @returns {Promise<any[]>} results 배열
 */
export async function fetchAllPages(path) {
  const first = await fetchFromApi(path);
  let results = [...first.results];
  let next = first.next;

  while (next) {
    const page = await fetchFromApi(next);
    results = results.concat(page.results);
    next = page.next;
  }

  return results;
}
