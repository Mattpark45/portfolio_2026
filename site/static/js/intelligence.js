// Human MCP — Intelligence 허브: 카테고리 필터 · 검색 · 구독 신청(메일)
// 목록은 빌드 시 정적 HTML로 생성(scripts/build.py). 이 스크립트는 보이기/숨기기만 담당.
(function () {
  // 메일 앱 열기 (시험에서는 window.HMCP_OPEN 으로 가로챔)
  function open_(u) {
    if (typeof window.HMCP_OPEN === 'function') return window.HMCP_OPEN(u)
    location.href = u
  }
  var catsEl = document.getElementById('cats')
  var listEl = document.getElementById('list')
  var featEl = document.getElementById('feat')
  var emptyEl = document.getElementById('empty')
  var qEl = document.getElementById('q')
  if (!catsEl || !listEl) return

  var items = [].slice.call(listEl.querySelectorAll('a[data-cat]'))
  if (featEl) items.unshift(featEl)
  var cat = 'all'
  try {
    var sp = new URLSearchParams(location.search)
    if (sp.get('q') && qEl) qEl.value = sp.get('q')
    if (sp.get('cat') && catsEl.querySelector('[data-cat="' + sp.get('cat') + '"]')) cat = sp.get('cat')
  } catch (e) {}

  var btns = [].slice.call(catsEl.querySelectorAll('button[data-cat]'))
  function press() {
    btns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === cat))
    })
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      cat = b.getAttribute('data-cat')
      press()
      filter()
    })
  })

  function filter() {
    var q = (qEl && qEl.value ? qEl.value : '').trim().toLowerCase()
    var n = 0
    items.forEach(function (a) {
      var ok = (cat === 'all' || a.getAttribute('data-cat') === cat) &&
        (!q || (a.getAttribute('data-q') || '').toLowerCase().indexOf(q) > -1)
      a.style.display = ok ? '' : 'none'
      if (ok) n++
    })
    if (emptyEl) emptyEl.style.display = n ? 'none' : 'block'
  }

  var searchForm = document.getElementById('searchForm')
  if (searchForm)
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault()
      filter()
    })
  if (qEl) qEl.addEventListener('input', filter)
  press()
  filter()

  // 구독 신청: 서버 저장 없음. 사용자의 메일 앱으로 신청 메일을 작성하게 한다.
  var subForm = document.getElementById('subForm')
  if (subForm)
    subForm.addEventListener('submit', function (e) {
      e.preventDefault()
      var em = document.getElementById('subEmail')
      var ag = document.getElementById('subAgree')
      var note = document.getElementById('subNote')
      var ok = em && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())
      if (!ok) {
        note.textContent = '이메일 주소를 확인해 주세요.'
        em.focus()
        return
      }
      if (!ag.checked) {
        note.textContent = '발송 목적 이용에 동의해 주셔야 신청할 수 있습니다.'
        ag.focus()
        return
      }
      var body = '아래 주소로 Human MCP Intelligence 브리핑 구독을 신청합니다.\n\n이메일: ' + em.value.trim() +
        '\n동의: 브리핑 발송 목적 이용에 동의함\n\n(해지를 원하시면 언제든 이 메일에 "해지"라고 답장해 주세요.)'
      open_(
        'mailto:dhp.cfo@gmail.com?subject=' + encodeURIComponent('[브리핑 구독 신청]') +
        '&body=' + encodeURIComponent(body))
      note.textContent = '메일 앱이 열렸다면 보내기를 눌러 주세요. 보내신 뒤 첫 브리핑부터 받아 보실 수 있습니다.'
    })
})()
