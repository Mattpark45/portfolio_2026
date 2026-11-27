// 정적 검사: 외부 의존성 없음. 실행: node tests/check.mjs  (먼저 python3 scripts/build.py)
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(repo, 'site');
const BASE = 'https://human-mcp.pages.dev';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const all = walk(root);
const htmlFiles = all.filter((p) => p.endsWith('.html'));
const pages = htmlFiles.filter((p) => !p.endsWith('404.html'));
const header = readFileSync(join(repo, 'partials/header.html'), 'utf8');
const footer = readFileSync(join(repo, 'partials/footer.html'), 'utf8');

// 미심의 상태에서 공개 화면에 쓰지 않는 표현 (규칙 완화는 심의 승인 후 사용자 지시로만)
const FORBIDDEN = [
  '보험', '펀드', '변액', '적금', '예금', '연금보험', '수익률', '원금 보장', '원금보장', '확정 수익', '수익 보장', '혜택 보장',
  '절세', '세금 절감', '무료', '최저가', '100%', '가입하세요', '가입 권유', '추천 상품',
  '삼성생명', 'GFC', 'AFG', 'Authentic', 'A-CARE', 'A-LINK', 'A-LINE', '메디빅뱅', '설계사',
];
// 사실이 아닌 완료·접수 표현 (서버 전송이 없으므로)
const FAKE = ['구독 완료', '접수되었습니다', '확인 문자를 보내', '예약이 확정', '많이 읽은', '목업 지연'];
const PLACEHOLDER = ['교체 필요', 'TODO', 'lorem', 'example.com', '이미지</div>'];
const ALLOWED_HOSTS = new Set(['human-mcp.pages.dev', 'mattpark45.github.io', 'schema.org', 'cdn.jsdelivr.net', 'fonts.googleapis.com',
  'blog.naver.com', 'brunch.co.kr', 'www.youtube.com', 'www.instagram.com', 'www.linkedin.com', 'talk.naver.com', 'calendar.app.google', 'calendar.google.com']);
const STORAGE = ['localStorage', 'indexedDB', 'fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'document.cookie'];

const visible = (s) => s
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style>[\s\S]*?<\/style>/g, ' ')
  .replace(/\sstyle="[^"]*"/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/모태펀드/g, '');

const titles = new Map();
const descs = new Map();
const fileFor = (path) => {
  const p = path.replace(/\/$/, '') || '/';
  if (p === '/') return join(root, 'index.html');
  const cands = [join(root, p + '.html'), join(root, p, 'index.html'), join(root, p)];
  return cands.find((c) => existsSync(c) && statSync(c).isFile());
};

for (const file of htmlFiles) {
  const rel = relative(root, file);
  const s = readFileSync(file, 'utf8');
  const is404 = rel === '404.html';

  ok(s.includes('<html lang="ko">'), `${rel}: lang="ko" 없음`);
  ok(s.includes('<meta name="viewport"'), `${rel}: viewport 없음`);
  ok(s.replace(/ aria-current="page"/g, '').includes(header.replace(/ aria-current="page"/g, '')), `${rel}: 공통 머리글 불일치 (scripts/build.py 실행)`);
  ok(s.includes(footer), `${rel}: 공통 바닥글 불일치 (scripts/build.py 실행)`);
  ok(!/<script>(?!\s*<\/script>)/.test(s), `${rel}: 인라인 스크립트 금지 (CSP script-src 'self')`);
  ok((s.match(/<h1[\s>]/g) || []).length === 1, `${rel}: h1 은 정확히 1개`);

  const text = visible(s);
  for (const w of FORBIDDEN) ok(!text.includes(w), `${rel}: 미심의 금지 표현 "${w}"`);
  const jsonld = (s.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || []).join(' ');
  for (const w of FORBIDDEN) ok(!jsonld.includes(w), `${rel}: 구조화 데이터 금지 표현 "${w}"`);
  for (const w of FAKE) ok(!text.includes(w), `${rel}: 사실과 다른 완료 표현 "${w}"`);
  for (const w of PLACEHOLDER) ok(!s.includes(w), `${rel}: 작업용 문구 "${w}"`);
  ok(!/href="#"/.test(s), `${rel}: 빈 링크 href="#"`);
  ok(!/<form(?![^>]*(id="(searchForm|subForm|calcForm)"|class="h-search"))/.test(s), `${rel}: 승인되지 않은 입력 양식`);

  if (!is404) {
    const title = (s.match(/<title>([^<]+)<\/title>/) || [])[1];
    ok(title, `${rel}: title 없음`);
    if (title) { ok(!titles.has(title), `${rel}: title 중복 (${titles.get(title)})`); titles.set(title, rel); }
    const desc = (s.match(/<meta name="description" content="([^"]+)">/) || [])[1];
    ok(desc && desc.length >= 15 && desc.length <= 170, `${rel}: description 없음 또는 길이 부적합`);
    if (desc) { ok(!descs.has(desc), `${rel}: description 중복 (${descs.get(desc)})`); descs.set(desc, rel); }
    ok(/<link rel="canonical" href="https:\/\/human-mcp\.pages\.dev\/[^"]*">/.test(s), `${rel}: canonical 없음`);
    ok(/<meta property="og:image" content="https:\/\//.test(s), `${rel}: og:image 절대경로 아님`);
    ok(s.includes('application/rss+xml'), `${rel}: RSS 링크 없음`);
  }

  const linkScope = s.replace(/<section class="src"[\s\S]*?<\/section>/g, '');
  for (const [, href] of linkScope.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(mailto:|tel:|data:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      ok(ALLOWED_HOSTS.has(new URL(href).hostname), `${rel}: 허용되지 않은 외부 링크 ${href}`);
      continue;
    }
    if (href.startsWith('#')) { ok(s.includes(`id="${href.slice(1)}"`), `${rel}: 없는 앵커 ${href}`); continue; }
    if (!href.startsWith('/')) { ok(false, `${rel}: 상대경로 링크 ${href} (루트 기준만 사용)`); continue; }
    const [pq, hash] = href.split('#');
    const path = pq.split('?')[0];
    const target = fileFor(path);
    ok(target, `${rel}: 깨진 내부 링크 ${href}`);
    if (target && hash && target.endsWith('.html')) ok(readFileSync(target, 'utf8').includes(`id="${hash}"`), `${rel}: 없는 앵커 ${href}`);
  }
}

// 글: 작성일·검토일·자료 기준일·검토자·출처·Article JSON-LD 필수
const arts = pages.filter((f) => /intelligence[\\/][^\\/]+\.html$/.test(f));
ok(arts.length >= 5, `공개 글이 5개 미만 (${arts.length})`);
for (const f of arts) {
  const t = readFileSync(f, 'utf8');
  const r = relative(root, f);
  ok(/작성 <b>\d{4}\.\d{2}\.\d{2}<\/b>/.test(t) && /최근 검토 <b>\d{4}\.\d{2}\.\d{2}<\/b>/.test(t) && /자료 기준일 <b>/.test(t), `${r}: 날짜 표기 없음`);
  ok(/검토: /.test(t), `${r}: 검토자 표기 없음`);
  ok(/<section class="src" id="s\d+"><h3>출처<\/h3><ol><li/.test(t), `${r}: 출처 없음`);
  ok(t.includes('"@type": "Article"'), `${r}: Article JSON-LD 없음`);
}
// 비공개(draft) 글은 공개 폴더에 없어야 함
ok(!existsSync(join(root, 'intelligence', 'vietnam-export-2027.html')), 'draft 글이 공개됨');
ok(!existsSync(join(root, 'portal.html')), '고객 포털 콘셉트 페이지가 공개됨');

// 예약: Google 캘린더 예약 페이지 연결
ok(/href="https:\/\/calendar\.google\.com\/calendar\/appointments\/schedules\/[A-Za-z0-9_-]+/.test(readFileSync(join(root, 'booking.html'), 'utf8')), 'booking.html: Google 캘린더 예약 링크 없음');

// 피드·사이트맵·llms.txt
const rss = readFileSync(join(root, 'rss.xml'), 'utf8');
ok(rss.includes('<rss version="2.0"') && (rss.match(/<item>/g) || []).length === arts.length, 'rss.xml 항목 수 불일치');
const sm = readFileSync(join(root, 'sitemap.xml'), 'utf8');
for (const f of pages) {
  const rel = relative(root, f).replace(/\\/g, '/');
  const u = rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/, '');
  ok(sm.includes(`<loc>${BASE}${u}</loc>`), `sitemap.xml: ${u} 없음`);
}
ok(!sm.includes('/404'), 'sitemap.xml: 404 포함');
ok(readFileSync(join(root, 'llms.txt'), 'utf8').startsWith('# Human MCP'), 'llms.txt 없음');
ok(readFileSync(join(root, 'robots.txt'), 'utf8').includes(`Sitemap: ${BASE}/sitemap.xml`), 'robots.txt Sitemap 절대경로 아님');
const hdr = readFileSync(join(root, '_headers'), 'utf8');
ok(/script-src 'self';/.test(hdr) && /frame-ancestors 'none'/.test(hdr), '_headers: CSP 약화');

// 스크립트: 서버 전송·영구 저장 금지 (sessionStorage 만 허용: 새로고침 시 입력 유지)
for (const f of all.filter((p) => p.endsWith('.js'))) {
  const t = readFileSync(f, 'utf8');
  for (const api of STORAGE) ok(!t.includes(api), `${relative(root, f)}: 저장·전송 API 금지 (${api})`);
  if (/data-.*\.js$/.test(f)) for (const w of FORBIDDEN) ok(!t.includes(w), `${relative(root, f)}: 금지 표현 "${w}"`);
  for (const w of FAKE) ok(!t.includes(w), `${relative(root, f)}: 사실과 다른 완료 표현 "${w}"`);
}
const bk = readFileSync(join(root, 'static/js/booking.js'), 'utf8');
for (const w of FORBIDDEN) ok(!bk.includes(w), `booking.js: 금지 표현 "${w}"`);

if (fails.length) {
  console.error(`FAIL ${fails.length}건\n- ` + fails.join('\n- '));
  process.exit(1);
}
console.log(`PASS 정적 검사 (${htmlFiles.length}개 페이지, 글 ${arts.length}개)`);
