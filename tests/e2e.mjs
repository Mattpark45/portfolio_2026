// 브라우저 E2E: Playwright(chromium). 실행: node tests/e2e.mjs [--shots 폴더]
// 로컬 정적 서버를 띄워 모바일·데스크톱에서 주요 고객 동선을 확인한다.
import http from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
// 루트(Cloudflare)든 하위 경로든 동작하도록, 하위 경로에서 서비스해, 루트 기준 링크가 남아 있으면 실패하게 한다
const PREFIX = '/subpath-test';
const shotsDir = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(PREFIX + '/')) { res.writeHead(404); return res.end('outside base path'); }
  p = p.slice(PREFIX.length);
  let f = join(root, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${PREFIX}`;
const failedRequests = [];

const PAGES = ['/', '/individuals/', '/business/', '/how-we-work/', '/insights/', '/insights/policy-fund-2027/', '/insights/ai-basic-act-sme/', '/insights/family-business-succession-2026/', '/insights/vietnam-export-2027/', '/insights/first-meeting/', '/insights/company-vs-owner/', '/insights/support-programs/', '/prepare/', '/about/', '/contact/', '/privacy/'];
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
    page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith('http://127.0.0.1')) failedRequests.push(`${r.status()} ${r.url()}`); });

    for (const path of PAGES) {
      errors.length = 0;
      const resp = await page.goto(base + path, { waitUntil: 'load' });
      check(`[${vpName}] ${path} 200`, resp && resp.status() === 200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`[${vpName}] ${path} 가로 스크롤 없음`, overflow <= 1, `overflow=${overflow}px`);
      check(`[${vpName}] ${path} 스크립트 오류 없음`, errors.length === 0, errors.join(' | '));
      const imgNoAlt = await page.locator('img:not([alt])').count();
      check(`[${vpName}] ${path} 이미지 alt`, imgNoAlt === 0);
      {
        const bookingHrefs = await page.locator('[data-booking]').evaluateAll((els) => els.map((e) => e.href));
        check(`[${vpName}] ${path} 예약 버튼 → 연락처(예약 URL 미설정 시)`, bookingHrefs.length > 0 && bookingHrefs.every((h) => h === base + '/contact/#request'), bookingHrefs.join(','));
      }
      if (shotsDir && ['/', '/business/', '/individuals/', '/prepare/'].includes(path)) {
        mkdirSync(shotsDir, { recursive: true });
        await page.screenshot({ path: join(shotsDir, `${vpName}${path === '/' ? '-home' : path.replace(/\//g, '-').replace(/-$/, '')}.png`), fullPage: true });
      }
    }

    // 모든 내부 링크를 실제로 열어 본다 (하위 경로 기준)
    if (vpName === 'desktop') {
      const seen = new Set();
      for (const path of PAGES) {
        await page.goto(base + path);
        const links = await page.locator('a[href]').evaluateAll((els) => els.map((e) => e.href));
        for (const l of links) {
          const u = l.split('#')[0];
          if (!u.startsWith('http://127.0.0.1') || seen.has(u)) continue;
          seen.add(u);
          const r = await page.request.get(u);
          check(`[links] ${u.replace(base, '')} 200`, r.status() === 200, String(r.status()));
        }
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
      await page.click('#site-nav a[href="./business/"]');
      await page.waitForURL(base + '/business/');
      check('[mobile] 메뉴로 기업 페이지 이동', page.url() === base + '/business/');
    }
    await ctx.close();
  }

  // 3분 점검 위젯: 4단계 흐름, 필수 검증, 결과, 저장·전송 없음
  {
    const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile });
    await ctx.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
    const page = await ctx.newPage();
    await page.goto(base + '/');
    const reqs = [];
    page.on('request', (r) => reqs.push(r.url()));
    const dx = page.locator('#dx');
    check('[dx] 1단계 표시', (await dx.locator('.dx-step-label').textContent()).trim() === '1 / 4');
    await dx.getByRole('button', { name: '우리 회사' }).click();
    await dx.locator('input[value="성장 중 (매출 확대)"]').click();
    check('[dx] 단일 선택 시 자동으로 3단계', (await dx.locator('.dx-step-label').textContent()).trim() === '3 / 4');
    await dx.getByRole('button', { name: '다음' }).click();
    check('[dx] 관심사 미선택 시 오류 안내', ((await dx.locator('[role=alert]').textContent()) || '').includes('하나 이상'));
    await dx.locator('input[value="현금흐름·운전자금"]').check();
    await dx.getByRole('button', { name: '다음' }).click();
    await dx.getByRole('button', { name: '결과 보기' }).click();
    const txt = await dx.textContent();
    check('[dx] 결과 3줄 표시', ['지킬 것', '쓸 수 있는 것', '다음 기회', '운전자금'].every((t) => txt.includes(t)), txt.slice(0, 200));
    check('[dx] 결과에서 상담 요청 링크', (await dx.locator('a.btn').getAttribute('href')).endsWith('contact/#request'));
    const storage = await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length);
    check('[dx] 저장소 사용 없음', storage === 0);
    check('[dx] 점검 중 네트워크 요청 없음', reqs.length === 0, reqs.join(','));
    await ctx.close();
  }

  // 상담 준비 질문: 요약 생성, 메일 링크, 저장·전송 없음
  {
    const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile });
    await ctx.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
    const requests = [];
    const page = await ctx.newPage();
    await page.goto(base + '/prepare/');
    page.on('request', (r) => requests.push(r.url()));
    await page.check('input[name="kind"][value="business"]');
    check('[prepare] 기업 선택 시 기업 질문 표시', await page.locator('[data-kind="business"]').isVisible());
    check('[prepare] 기업 선택 시 개인 질문 숨김', !(await page.locator('[data-kind="individual"]').isVisible()));
    await page.check('input[name="size"][value="30~100억"]');
    await page.fill('textarea[data-name="goal_b"]', '새 고객층 확장');
    await page.check('[data-name="issue"] input[value="인력 채용·교육"]');
    await page.check('input[name="want"][value="여러 대안 비교"]');
    const summary = await page.textContent('#summary-text');
    check('[prepare] 요약에 입력 반영', ['기업·경영자', '30~100억', '새 고객층 확장', '인력 채용·교육', '여러 대안 비교'].every((t) => summary.includes(t)), summary);
    const mailHref = await page.getAttribute('#mail-btn', 'href');
    check('[prepare] 메일 링크에 요약 포함', mailHref.startsWith('mailto:dhp.cfo@gmail.com?') && decodeURIComponent(mailHref).includes('새 고객층 확장'));
    const storage = await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length);
    check('[prepare] 브라우저 저장소에 아무것도 남기지 않음', storage === 0, String(storage));
    check('[prepare] 입력 중 네트워크 요청 없음', requests.length === 0, requests.join(','));
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

check('하위 경로에서 404 요청 없음 (CSS·JS·링크 자원)', failedRequests.length === 0, [...new Set(failedRequests)].slice(0, 5).join(' | '));
const failed = results.filter((r) => !r.pass);
for (const r of failed) console.error(`FAIL ${r.name} ${r.detail}`);
console.log(`${failed.length ? 'FAIL' : 'PASS'} E2E ${results.length - failed.length}/${results.length}`);
process.exit(failed.length ? 1 : 0);
