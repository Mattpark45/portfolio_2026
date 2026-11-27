// Shared header / footer / mobile drawer / mobile CTA for Human MCP pages
// <div data-hdr data-site></div>  → links point to real site pages (site/ folder)
(function(){
  const hdrEl = document.querySelector('[data-hdr]');
  const ftrEl = document.querySelector('[data-ftr]');
  const site = !!document.querySelector('[data-site]');
  const P = site ? {
    home:'Home.html', corp:'Home.html#corp', fin:'Home.html#fin', growth:'Home.html#growth', ax:'Home.html#ax',
    tools:'Home.html#tools', intel:'Article.html', about:'Home.html#about', book:'Booking.html', contact:'#contact'
  } : {home:'#top',corp:'#corp',fin:'#fin',growth:'#growth',ax:'#ax',tools:'#tools',intel:'#intel',about:'#about',book:'#book',contact:'#contact'};
  const NAV = [
    ['기업 경영자문',P.corp,'세무 · 승계 · 인증 · 노무'],['개인·법인 종합금융',P.fin,'재무설계 · 보장 · 연금'],['Growth & Capital',P.growth,'GTM · 투자 · M&A'],
    ['디지털 진단',P.tools,'3분 점검 · 재무X레이'],['Intelligence',P.intel,'경영 · 재무 브리핑'],['About',P.about,'Human MCP 소개']
  ];
  if (hdrEl){
    hdrEl.outerHTML = `
    <header class="hdr">
      <div class="wrap">
        <a class="logo" href="${P.home}" aria-label="Human MCP 홈"><b>HUMAN MCP</b><small>FINANCIAL &amp; BUSINESS ADVISORY</small></a>
        <nav class="nav" aria-label="주요 메뉴">${NAV.map(([t,h])=>`<a href="${h}">${t}</a>`).join('')}</nav>
        <a class="btn btn-primary" href="${P.book}" style="min-height:42px">30분 첫 상담 예약</a>
        <button class="menu-btn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="drawer"><span></span></button>
      </div>
    </header>
    <div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="메뉴">
      <div class="top"><a class="logo" href="${P.home}"><b>HUMAN MCP</b><small>FINANCIAL &amp; BUSINESS ADVISORY</small></a><button class="x" aria-label="메뉴 닫기">×</button></div>
      <nav>${NAV.map(([t,h,s])=>`<a href="${h}"><span>${t}</span><small>${s}</small></a>`).join('')}</nav>
      <a class="btn btn-primary" href="${P.book}">30분 첫 상담 예약</a>
      <a class="btn btn-secondary" href="${P.tools}">내 상황 점검하기</a>
    </div>`;
    const d = document.getElementById('drawer'), mb = document.querySelector('.menu-btn');
    const set = o => { d.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
    mb.onclick = () => set(true);
    d.querySelector('.x').onclick = () => set(false);
    d.querySelectorAll('nav a, .btn').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
  if (ftrEl){
    const noCta = ftrEl.hasAttribute('data-no-mcta');
    ftrEl.outerHTML = `
    <footer class="ftr on-dark" id="contact">
      <div class="wrap">
        <div class="cols">
          <div>
            <div class="logo" style="margin-bottom:18px"><b style="color:var(--ivory)">HUMAN MCP</b><small style="color:rgba(246,243,236,.6)">FINANCIAL &amp; BUSINESS ADVISORY</small></div>
            <p style="max-width:300px">박동혁 · 중소기업경영연구소 경영컨설팅·자산관리 부문 전문위원 · Authentic금융그룹(AFG) 소속 <span class="sample">직함 표기 확인 필요</span></p>
          </div>
          <div><h4>서비스</h4><ul><li><a href="${P.corp}">기업 경영자문</a></li><li><a href="${P.fin}">개인·법인 종합금융</a></li><li><a href="${P.growth}">Growth &amp; Capital</a></li><li><a href="${P.ax}">AI/AX 및 교육</a></li></ul></div>
          <div><h4>탐색</h4><ul><li><a href="${P.tools}">디지털 진단센터</a></li><li><a href="${P.intel}">Intelligence</a></li><li><a href="${P.about}">About</a></li><li><a href="${P.book}">상담예약</a></li></ul></div>
          <div><h4>연락</h4><ul><li><a href="mailto:dhp.cfo@gmail.com">dhp.cfo@gmail.com</a></li><li><a href="#">네이버 톡톡</a></li><li><a href="#">LinkedIn</a> · <a href="#">YouTube</a></li><li><a href="#">브런치</a> · <a href="#">블로그</a> · <a href="#">Instagram</a></li></ul></div>
        </div>
        <div class="disc">
          본 사이트의 금융 관련 정보는 일반적인 안내이며 특정 상품의 권유가 아닙니다. 보험·투자 상품의 계약 체결 전 상품설명서와 약관을 반드시 확인하시기 바랍니다.
          세무·법률·노무·특허 등 전문 업무는 해당 자격을 보유한 협업 전문가가 수행하며, Human MCP는 상담·연결·조율을 담당합니다. 보험 가입은 다른 서비스 이용의 조건이 아닙니다.
          <span class="sample">최종 고지 문구는 AFG 준법감시 검토 후 확정</span><br><br>
          <a href="#">개인정보 처리방침</a> · <a href="#">이용약관</a> · <a href="#">업무 범위 안내</a> &nbsp;&nbsp; © 2026 Human MCP
        </div>
      </div>
    </footer>
    ${noCta?'':`<div class="m-cta"><a class="btn btn-secondary" href="${P.tools}">내 상황 점검</a><a class="btn btn-primary" href="${P.book}">30분 첫 상담</a></div>`}`;
  }
})();
