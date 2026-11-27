// 브라우저 E2E: Playwright(chromium). 실행: node tests/e2e.mjs [--shots 폴더]
// 로컬 정적 서버를 띄워 모바일·데스크톱에서 주요 고객 동선을 확인한다.
import http from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const shotsDir = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(root, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const PAGES = ['/', '/personal/', '/business/', '/about/', '/contact/', '/privacy/', '/portfolio/'];
const VIEWPORTS = { mobile: { width: 390, height: 844 }, desktop: { width: 1280, height: 800 } };
const results = [];
const check = (name, cond, detail = '') => results.push({ name, pass: !!cond, detail });

const browser = await chromium.launch();
try {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    // 외부 폰트 CDN은 시험에서 차단(네트워크 의존 제거). 실패해도 시스템 폰트로 표시되어야 함
    await ctx.route(/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    for (const path of PAGES) {
      errors.length = 0;
      const resp = await page.goto(base + path, { waitUntil: 'load' });
      check(`[${vpName}] ${path} 200`, resp && resp.status() === 200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`[${vpName}] ${path} 가로 스크롤 없음`, overflow <= 1, `overflow=${overflow}px`);
      check(`[${vpName}] ${path} 스크립트 오류 없음`, errors.length === 0, errors.join(' | '));
      const imgNoAlt = await page.locator('img:not([alt])').count();
      check(`[${vpName}] ${path} 이미지 alt`, imgNoAlt === 0);
      if (path !== '/portfolio/') {
        const bookingHrefs = await page.locator('[data-booking]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
        check(`[${vpName}] ${path} 예약 버튼 → 연락처(예약 URL 미설정 시)`, bookingHrefs.length > 0 && bookingHrefs.every((h) => h === '/contact/#request'), bookingHrefs.join(','));
      }
      if (shotsDir && (path === '/' || path === '/business/' || path === '/personal/')) {
        mkdirSync(shotsDir, { recursive: true });
        await page.screenshot({ path: join(shotsDir, `${vpName}${path === '/' ? '-home' : path.replace(/\//g, '-').replace(/-$/, '')}.png`), fullPage: true });
      }
    }

    // 연락처: 예약 미설정 상태 안내 표시
    await page.goto(base + '/contact/');
    check(`[${vpName}] 연락처: 준비 중 안내 표시`, await page.locator('[data-booking-pending]').isVisible());
    check(`[${vpName}] 연락처: 예약 블록 숨김`, !(await page.locator('[data-booking-ready]').isVisible()));
    check(`[${vpName}] 연락처: 전화 링크`, (await page.locator('a[href="tel:01049377837"]').count()) > 0);

    if (vpName === 'mobile') {
      await page.goto(base + '/');
      const nav = page.locator('#site-nav');
      check('[mobile] 메뉴 처음엔 닫힘', !(await nav.isVisible()));
      await page.click('.menu-btn');
      check('[mobile] 메뉴 열림', await nav.isVisible());
      check('[mobile] aria-expanded 갱신', (await page.getAttribute('.menu-btn', 'aria-expanded')) === 'true');
      await page.click('#site-nav a[href="/business/"]');
      await page.waitForURL(base + '/business/');
      check('[mobile] 메뉴로 기업 페이지 이동', page.url() === base + '/business/');
    }
    await ctx.close();
  }

  // 예약 URL을 설정한 경우의 동작 (site.js를 가로채 값 주입)
  const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  await ctx.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
  await ctx.route('**/assets/site.js', async (r) => {
    const body = readFileSync(join(root, 'assets/site.js'), 'utf8').replace("var BOOKING_URL = '';", "var BOOKING_URL = 'https://calendar.app.google/TESTONLY';");
    await r.fulfill({ contentType: 'text/javascript', body });
  });
  const page = await ctx.newPage();
  await page.goto(base + '/contact/');
  const hrefs = await page.locator('[data-booking]').evaluateAll((els) => els.map((e) => [e.getAttribute('href'), e.getAttribute('target')]));
  check('[booking] 설정 시 모든 예약 버튼 → Google 캘린더, 새 창', hrefs.every(([h, t]) => h === 'https://calendar.app.google/TESTONLY' && t === '_blank'));
  check('[booking] 설정 시 예약 블록 표시', await page.locator('[data-booking-ready]').isVisible());
  check('[booking] 설정 시 준비 중 안내 숨김', !(await page.locator('[data-booking-pending]').isVisible()));
  await ctx.close();
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.pass);
for (const r of failed) console.error(`FAIL ${r.name} ${r.detail}`);
console.log(`${failed.length ? 'FAIL' : 'PASS'} E2E ${results.length - failed.length}/${results.length}`);
process.exit(failed.length ? 1 : 0);
