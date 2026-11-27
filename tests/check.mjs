// 정적 검사: 외부 의존성 없음. 실행: node tests/check.mjs
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(repo, 'site');
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (['.git', 'node_modules', 'partials', 'tests', 'scripts', 'docs'].includes(n)) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const htmlFiles = walk(root).filter((p) => p.endsWith('.html'));
const sitePages = htmlFiles.filter((p) => !p.endsWith('404.html'));

const header = readFileSync(join(repo, 'partials/header.html'), 'utf8').trim();
const footer = readFileSync(join(repo, 'partials/footer.html'), 'utf8').trim();

// 미심의 상태에서 공개 페이지에 쓰지 않는 표현 (금융상품명·권유·수익/혜택 약속·소속 전산·과거 소속)
const FORBIDDEN = [
  '보험', '펀드', '변액', '적금', '예금', '연금보험', '수익률', '원금 보장', '원금보장', '확정 수익', '수익 보장', '혜택 보장',
  '절세', '세금 절감', '무료', '최저가', '100%', '가입하세요', '가입 권유', '추천 상품',
  '삼성생명', 'GFC', 'AFG', 'A-CARE', 'A-LINK', 'A-LINE', '메디빅뱅', '설계사',
];
const PLACEHOLDER = ['교체 필요', '교체 권장', 'TODO', 'lorem', 'example.com'];
const ALLOWED_HOSTS = new Set(['ebook.icm.re.kr', 'mattpark45.github.io', 'cdn.jsdelivr.net', 'calendar.app.google', 'calendar.google.com', 'schema.org']);

// scripts/sync_layout.py 와 같은 규칙: 루트 기준 링크 → 페이지 깊이에 맞춘 상대경로
const relativize = (html, depth) => html.replace(/\b(href|src)="\/(?!\/)([^"]*)"/g, (_, a, p) => `${a}="${depth === 0 ? './' : '../'.repeat(depth)}${p}"`);

const titles = new Map();
const descs = new Map();

for (const file of sitePages) {
  const rel = relative(root, file);
  const s = readFileSync(file, 'utf8');
  const depth = rel.split(/[\\/]/).length - 1;
  const text = s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

  ok(/<html lang="ko">/.test(s), `${rel}: lang="ko" 없음`);
  ok(/<meta name="viewport" content="width=device-width, initial-scale=1">/.test(s), `${rel}: viewport 없음`);
  const title = (s.match(/<title>([^<]+)<\/title>/) || [])[1];
  ok(title, `${rel}: title 없음`);
  if (title) { ok(!titles.has(title), `${rel}: title 중복 (${titles.get(title)})`); titles.set(title, rel); }
  const desc = (s.match(/<meta name="description" content="([^"]+)">/) || [])[1];
  ok(desc && desc.length >= 20 && desc.length <= 160, `${rel}: description 없음 또는 길이 부적합`);
  if (desc) { ok(!descs.has(desc), `${rel}: description 중복`); descs.set(desc, rel); }
  ok((s.match(/<h1[\s>]/g) || []).length === 1, `${rel}: h1 은 정확히 1개여야 함`);
  ok(s.includes(`<!-- layout:header -->\n${relativize(header, depth)}\n<!-- /layout:header -->`), `${rel}: 공통 header 불일치 (scripts/sync_layout.py 실행)`);
  ok(s.includes(`<!-- layout:footer -->\n${relativize(footer, depth)}\n<!-- /layout:footer -->`), `${rel}: 공통 footer 불일치 (scripts/sync_layout.py 실행)`);
  ok(!/<form[\s>]/i.test(s), `${rel}: 입력 양식 금지 (개인정보 수집 경로 미승인)`);
  ok(!/<script>(?!\s*$)/.test(s), `${rel}: 인라인 스크립트 금지 (CSP)`);

  for (const w of FORBIDDEN) ok(!text.includes(w), `${rel}: 미심의 금지 표현 "${w}"`);
  for (const w of PLACEHOLDER) ok(!s.includes(w), `${rel}: 작업용 문구 "${w}"`);

  ok(!/\b(href|src)="\/(?!\/)/.test(s), `${rel}: 루트 기준 내부 링크 금지 (하위 경로 배포에서 깨짐) — scripts/sync_layout.py 실행`);
  for (const [, href] of s.matchAll(/href="([^"]+)"/g)) {
    if (/^(mailto:|tel:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      ok(ALLOWED_HOSTS.has(new URL(href).hostname), `${rel}: 허용되지 않은 외부 링크 ${href}`);
      continue;
    }
    const [path, hash] = href.split('#');
    if (!path) continue;
    const abs = join(dirname(file), path);
    const target = path.endsWith('/') || path === '.' || path === '..' ? join(abs, 'index.html') : abs;
    ok(existsSync(target), `${rel}: 깨진 내부 링크 ${href}`);
    if (hash && existsSync(target)) ok(readFileSync(target, 'utf8').includes(`id="${hash}"`), `${rel}: 없는 앵커 ${href}`);
  }
}

// site.js 예약 URL은 비어 있거나 Google 캘린더 주소여야 함
const js = readFileSync(join(root, 'assets/site.js'), 'utf8');
// 상담 준비 질문 스크립트는 저장·전송 API를 쓰면 안 됨
const prep = readFileSync(join(root, 'assets/prepare.js'), 'utf8');
for (const api of ['localStorage', 'sessionStorage', 'indexedDB', 'fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'document.cookie']) ok(!prep.includes(api), `prepare.js: 저장·전송 API 사용 금지 (${api})`);
const url = (js.match(/var BOOKING_URL = '([^']*)'/) || [])[1];
ok(url !== undefined, 'site.js: BOOKING_URL 정의 없음');
ok(url === '' || /^https:\/\/(calendar\.app\.google|calendar\.google\.com)\//.test(url), 'site.js: BOOKING_URL 은 Google 캘린더 주소만 허용');

if (fails.length) {
  console.error(`FAIL ${fails.length}건\n- ` + fails.join('\n- '));
  process.exit(1);
}
console.log(`PASS 정적 검사 (${sitePages.length}개 페이지)`);
