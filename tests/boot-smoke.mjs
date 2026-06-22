/* boot-smoke.mjs — 부팅/빌드 회귀 방지 (#871 Vite 전환으로 갱신)
 *
 * (구) 자체 호스팅 Babel(vendor/babel.min.js)로 loadBabel 변환 검증 → Vite 전환으로 폐기.
 * (신) Vite 빌드 산출물 검증: dist/index.html 이 생성되고 해시된 JS 진입 번들을 참조하는지.
 *      CI 는 이 스크립트 전에 `cd docs/readinggo && npm ci && npm run build` 를 실행한다.
 *
 * 실행: node tests/boot-smoke.mjs   (exit 1 = 빌드 회귀)
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'readinggo');
const indexPath = join(root, 'dist', 'index.html');

function fail(msg) { console.error('✘ boot-smoke:', msg); process.exit(1); }

if (!existsSync(indexPath)) fail(`dist/index.html 없음 — 'cd docs/readinggo && npm run build' 선행 필요`);
const html = readFileSync(indexPath, 'utf8');

// 해시된 module 진입 번들 참조 확인.
if (!/<script[^>]+type="module"[^>]+src="[^"]*assets\/index-[A-Za-z0-9_-]+\.js"/.test(html)) {
  fail('dist/index.html 에 해시된 module 진입 번들 참조 없음');
}
// 런타임 Babel/CDN 잔재 없어야.
if (/loadBabel|vendor\/babel|unpkg\.com\/react/.test(html)) {
  fail('dist/index.html 에 런타임 Babel/CDN 잔재 — Vite 전환 미완');
}
// 부트 placeholder(#root) 유지.
if (!/id="root"/.test(html)) fail('#root 없음');

console.log('✓ boot-smoke: Vite 빌드 산출물 정상 (해시 번들 + #root, 런타임 Babel 제거됨)');
