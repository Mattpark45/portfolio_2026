// Human MCP — Network Routing 탐색기
(function () {
  var R = window.HMCP_ROUTING || []
  var list = document.querySelector('.r-list')
  var view = document.getElementById('rView')
  if (!list || !view || !R.length) return

  var LBL = { d: '직접', c: '협업', r: '소개' }
  var btns = [].slice.call(list.querySelectorAll('button[role="tab"]'))

  function show(i) {
    var r = R[i]
    btns.forEach(function (b, k) {
      b.setAttribute('aria-selected', String(k === i))
      b.tabIndex = k === i ? 0 : -1
    })
    view.innerHTML =
      '<p class="q">"' + r.k + '"</p><p class="sub">' + r.sub + '</p><div class="flow">' +
      r.f
        .map(function (row) {
          return (
            '<div class="st"><span class="who ' + row[0] + '">' + LBL[row[0]] +
            '</span><div><b>' + row[1] + '</b><span>' + row[2] + '</span></div></div>'
          )
        })
        .join('') +
      '</div><div class="cta"><a class="btn btn-primary" href="' + r.cta[0] + '">' + r.cta[1] + '</a></div>'
  }

  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { show(i) })
    b.addEventListener('keydown', function (e) {
      var nxt = null
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nxt = (i + 1) % btns.length
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nxt = (i - 1 + btns.length) % btns.length
      if (nxt !== null) {
        e.preventDefault()
        btns[nxt].focus()
        show(nxt)
      }
    })
  })

  show(0)
})()
