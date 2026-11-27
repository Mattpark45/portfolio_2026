// 브라우저 E2E: Playwright(chromium). 실행: node tests/e2e.mjs [--shots 폴더]
// Cloudflare Pages 와 같은 규칙(확장자 없는 주소 → .html, _headers 의 CSP)으로 로컬 서버를 띄워 확인한다.
import http from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const shotsDir = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const CSP = (readFileSync(join(root, '_headers'), 'utf8').match(/Content-Security-Policy: (.+)/) || [])[1];

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const cands = p === '/' ? ['index.html'] : [p.slice(1), p.slice(1) + '.html', p.slice(1).replace(/\/$/, '') + '.html'];
  const f = cands.map((c) => join(root, c)).find((c) => c.startsWith(root) && existsSync(c) && statSync(c).isFile());
  if (!f) { res.writeHead(404, { 'Content-Type': TYPES['.html'] }); return res.end(readFileSync(join(root, '404.html'))); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream', 'Content-Security-Policy': CSP });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const PAGES = ['/', '/corporate', '/personal', '/owner', '/growth', '/ax', '/network', '/diagnostics', '/intelligence', '/about', '/booking',
  '/legal/privacy', '/legal/terms', '/legal/scope', '/intelligence/policy-fund-2027', '/intelligence/minimum-wage-2027', '/intelligence/first-meeting'];
const VIEWPORTS = { mobile: { width: 390, height: 844 }, desktop: { width: 1280, height: 800 } };
const results = [];
const check = (name, cond, detail = '') => results.push({ name, pass: !!cond, detail });

const browser = await chromium.launch();
try {
  for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await ctx.route(/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com|calendar\.google\.com/, (r) => r.abort());
    const page = await ctx.newPage();
    const errors = [];
    const bad = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy/.test(m.text())) errors.push(m.text()); });
    page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base)) bad.push(`${r.status()} ${r.url()}`); });

    for (const path of PAGES) {
      errors.length = 0; bad.length = 0;
      const resp = await page.goto(base + path, { waitUntil: 'load' });
      check(`[${vp}] ${path} 200`, resp && resp.status() === 200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`[${vp}] ${path} 가로 스크롤 없음`, overflow <= 1, `overflow=${overflow}px`);
      check(`[${vp}] ${path} 스크립트·CSP 오류 없음`, errors.length === 0, errors.join(' | '));
      check(`[${vp}] ${path} 깨진 리소스 없음`, bad.length === 0, bad.join(', '));
      check(`[${vp}] ${path} 이미지 alt`, (await page.locator('img:not([alt])').count()) === 0);
      if (shotsDir && ['/', '/intelligence', '/intelligence/policy-fund-2027', '/booking'].includes(path)) {
        mkdirSync(shotsDir, { recursive: true });
        await page.screenshot({ path: join(shotsDir, `${vp}${path.replace(/\//g, '_') || '_home'}.png`), fullPage: true });
      }
    }

    // 모바일 메뉴
    if (vp === 'mobile') {
      await page.goto(base + '/');
      await page.click('.menu-btn');
      check('[mobile] 메뉴 열림', await page.locator('#drawer.open').count() === 1);
      await page.keyboard.press('Escape');
      check('[mobile] 메뉴 닫힘(Esc)', await page.locator('#drawer.open').count() === 0);
    }

    // Intelligence 허브: 필터·검색·구독 동의
    await page.goto(base + '/intelligence');
    const total = await page.locator('#list a, #feat').count();
    await page.click('#cats button[data-cat="policy"]');
    const policyVisible = await page.locator('#list a:visible, #feat:visible').count();
    check(`[${vp}] 허브 카테고리 필터`, policyVisible > 0 && policyVisible < total, `${policyVisible}/${total}`);
    await page.click('#cats button[data-cat="all"]');
    await page.fill('#q', '최저임금');
    check(`[${vp}] 허브 검색`, (await page.locator('#list a:visible, #feat:visible').count()) === 1);
    await page.fill('#q', 'zzzz없는검색어');
    check(`[${vp}] 허브 빈 결과 안내`, await page.locator('#empty').isVisible());
    await page.goto(base + '/intelligence?cat=ax');
    check(`[${vp}] 허브 ?cat= 반영`, (await page.locator('#cats button[data-cat="ax"][aria-pressed="true"]').count()) === 1);

    await page.goto(base + '/intelligence#subscribe');
    await page.evaluate(() => { window.__opened = null; window.HMCP_OPEN = (u) => { window.__opened = u; }; });
    await page.fill('#subEmail', 'reader@test.invalid');
    await page.click('#subForm button');
    check(`[${vp}] 구독: 동의 없이 진행 안 됨`, /동의/.test(await page.textContent('#subNote')) && !(await page.evaluate(() => window.__opened)));
    await page.check('#subAgree');
    await page.click('#subForm button');
    const sub = await page.evaluate(() => window.__opened);
    check(`[${vp}] 구독: 메일 작성으로 연결 (서버 전송 없음)`, sub && sub.startsWith('mailto:dhp.cfo@gmail.com') && decodeURIComponent(sub).includes('reader@test.invalid'), String(sub).slice(0, 60));
    check(`[${vp}] 구독: 완료로 표시하지 않음`, !/완료/.test(await page.textContent('#subForm')));

    // 상담 요청 4단계 → 메일 작성 (가짜 접수 없음)
    await page.goto(base + '/booking');
    await page.evaluate(() => { sessionStorage.clear(); window.__opened = null; window.HMCP_OPEN = (u) => { window.__opened = u; }; });
    await page.click('[data-type="corp"]');
    await page.click('[data-a="next"]');
    await page.click('[data-a="next"]');
    await page.click('.day >> nth=0');
    await page.click('.slot >> nth=0');
    await page.click('[data-a="next"]');
    await page.fill('#name', '시험');
    await page.fill('#tel', '010-0000-0000');
    await page.check('#c1');
    await page.check('#c2');
    await page.click('[data-a="next"]');
    const bk = await page.evaluate(() => window.__opened);
    check(`[${vp}] 상담 요청: 메일 작성으로 연결`, bk && decodeURIComponent(bk).includes('희망 일정'), String(bk).slice(0, 60));
    check(`[${vp}] 상담 요청: 확정·접수로 표시하지 않음`, !/접수되었습니다|확인 문자/.test(await page.textContent('main')));

    // 3분 점검 → 결과
    await page.goto(base + '/');
    await page.click('#dx [data-t="corp"]');
    for (let i = 0; i < 6 && !(await page.locator('#dx .dx-res, #dx [data-res]').count()); i++) {
      const opt = page.locator('#dx .dx-opt').first();
      if (!(await opt.count())) break;
      await opt.click();
      const next = page.locator('#dx [data-a="next"]:not([disabled])');
      if (await next.count()) await next.click();
    }
    check(`[${vp}] 3분 점검 진행`, (await page.textContent('#dxStep')) !== '1 / 4');
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.name}${r.pass || !r.detail ? '' : ' — ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} PASS`);
process.exit(failed.length ? 1 : 0);
