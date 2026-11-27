// Human MCP — Personal 페이지: 생애 단계 탭 + 은퇴자금 계산기
(function () {
  var LIFE = window.HMCP_LIFE || []
  var panel = document.getElementById('lifePanel')
  var tabs = [].slice.call(document.querySelectorAll('.life button'))

  function showLife(k) {
    if (!panel || !LIFE[k]) return
    var d = LIFE[k]
    panel.innerHTML =
      '<div><h4 class="r">지킬 것</h4><ul>' +
      d.r.map(function (x) { return '<li>' + x + '</li>' }).join('') +
      '</ul></div><div><h4 class="b">쓸 수 있는 것</h4><ul>' +
      d.b.map(function (x) { return '<li>' + x + '</li>' }).join('') +
      '</ul></div><div><h4 class="g">준비할 것</h4><ul>' +
      d.g.map(function (x) { return '<li>' + x + '</li>' }).join('') +
      '</ul></div>'
  }

  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)) })
      showLife(Number(b.dataset.k))
    })
    b.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(b)
      var next = null
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length]
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length]
      if (next) {
        e.preventDefault()
        next.focus()
        next.click()
      }
    })
  })
  showLife(0)

  // 은퇴자금 계산기
  var form = document.getElementById('calcForm')
  if (!form) return
  var $ = function (id) { return document.getElementById(id) }

  function won(n) {
    return n >= 10000 ? (n / 10000).toFixed(1) + '억원' : n.toLocaleString('ko-KR') + '만원'
  }

  function calc() {
    var age = Number($('age').value)
    var ret = Math.max(Number($('ret').value), age + 1)
    var need = Number($('need').value)
    var pen = Number($('pen').value)

    $('o_age').textContent = age + '세'
    $('o_ret').textContent = ret + '세'
    $('o_need').textContent = need + '만원'
    $('o_pen').textContent = pen + '만원'

    var months = (90 - ret) * 12
    var gap = Math.max(0, need - pen) * months
    var pct = need > 0 ? Math.min(100, Math.round((pen / need) * 100)) : 0

    $('r_big').textContent = won(gap)
    $('r_sub').textContent = '은퇴까지 ' + (ret - age) + '년 · 은퇴 후 ' + (90 - ret) + '년 기준'
    $('r_bar').style.width = pct + '%'
    $('r_pct').textContent = pct + '%'
  }

  form.addEventListener('input', calc)
  form.addEventListener('submit', function (e) { e.preventDefault() })
  calc()
})()
