// Human MCP — 3분 점검 위젯 (규칙 기반, 서버 저장 없음)
// 설정: window.HMCP_DX = { q: {...}, res: {...}, book: '/booking' }
(function () {
  var root = document.getElementById('dx')
  if (!root) return
  var CFG = window.HMCP_DX
  if (!CFG) return

  var BOOK = root.dataset.book || CFG.book || '/booking'
  var TOTAL = 4
  var st = { type: null, i: 0, ans: [] }

  var $ = function (id) {
    return document.getElementById(id)
  }

  function pick(map, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (map[arr[i]]) return map[arr[i]]
    }
    return map._ || null
  }

  function render() {
    var body = $('dxBody')
    var bar = $('dxBar')
    var step = $('dxStep')
    var label = $('dxLabel')
    if (!body) return

    if (!st.type) {
      step.textContent = '1 / ' + TOTAL
      bar.style.width = '25%'
      label.textContent = '내 상황 점검'
      body.innerHTML =
        '<h2>누구의 상황을 점검할까요?</h2><p class="hint">결과는 바로 화면에 보여 드립니다.</p>' +
        '<div class="dx-opts two">' +
        '<button type="button" class="dx-opt big" data-t="corp"><b>우리 회사</b><small>법인 · 개인사업자</small></button>' +
        '<button type="button" class="dx-opt big" data-t="ind"><b>나와 가족</b><small>개인 · 가정</small></button>' +
        '</div><div class="dx-nav"><span></span></div>'
      body.querySelectorAll('[data-t]').forEach(function (b) {
        b.onclick = function () {
          st = { type: b.dataset.t, i: 0, ans: [[], [], []] }
          render()
        }
      })
      return
    }

    var qs = CFG.q[st.type]

    if (st.i < qs.length) {
      var q = qs[st.i]
      var sel = st.ans[st.i]
      step.textContent = st.i + 2 + ' / ' + TOTAL
      bar.style.width = ((st.i + 2) / TOTAL) * 100 + '%'
      label.textContent = st.type === 'corp' ? '우리 회사 점검' : '나와 가족 점검'

      var needPick = !sel.length && st.i < 2
      body.innerHTML =
        '<h2>' +
        q.q +
        '</h2><p class="hint">' +
        q.hint +
        '</p><div class="dx-opts">' +
        q.opts
          .map(function (o) {
            var on = sel.indexOf(o) > -1
            return (
              '<button type="button" class="dx-opt" aria-pressed="' +
              on +
              '"><span class="box">' +
              (on ? '✓' : '') +
              '</span>' +
              o +
              '</button>'
            )
          })
          .join('') +
        '</div><div class="dx-nav"><button type="button" class="dx-back">← 이전</button>' +
        '<button type="button" class="btn btn-primary" id="dxNext"' +
        (needPick ? ' disabled style="opacity:.4;cursor:not-allowed"' : '') +
        '>' +
        (st.i === qs.length - 1 ? '결과 보기' : '다음') +
        '</button></div>'

      body.querySelectorAll('.dx-opt').forEach(function (b, k) {
        b.onclick = function () {
          var o = q.opts[k]
          if (q.multi) {
            var ix = sel.indexOf(o)
            if (ix > -1) sel.splice(ix, 1)
            else sel.push(o)
          } else {
            sel.length = 0
            sel.push(o)
            st.i++
          }
          render()
        }
      })
      body.querySelector('.dx-back').onclick = function () {
        if (st.i === 0) st.type = null
        else st.i--
        render()
      }
      $('dxNext').onclick = function () {
        if (!sel.length && st.i < 2) return
        st.i++
        render()
      }
      return
    }

    // 결과
    var flat = st.ans.reduce(function (a, b) {
      return a.concat(b)
    }, [])
    var R = CFG.res[st.type]
    step.textContent = '결과'
    bar.style.width = '100%'
    var corp = st.type === 'corp'

    body.innerHTML =
      '<div class="dx-res"><h2>먼저 살펴볼 세 가지</h2>' +
      '<p class="hint">' +
      (flat.slice(0, 3).join(' · ') || '선택한 항목이 없습니다.') +
      '</p>' +
      '<div class="row"><span class="lbl r">지킬 것</span><p>' +
      pick(R.r, flat) +
      '</p></div>' +
      '<div class="row"><span class="lbl b">쓸 수 있는 것</span><p>' +
      pick(R.b, flat) +
      '</p></div>' +
      '<div class="row"><span class="lbl g">다음 기회</span><p>' +
      pick(R.g, flat) +
      '</p></div>' +
      '<div class="next"><a class="btn btn-primary" href="' +
      BOOK +
      '" id="dxBook">이 결과로 30분 상담 예약</a>' +
      '<a class="btn btn-secondary" href="' +
      (corp ? '/diagnostics#xray' : '/intelligence') +
      '">' +
      (corp ? '재무X레이로 더 보기' : '관련 글 읽기') +
      '</a></div>' +
      '<div class="dx-nav" style="padding-top:14px"><button type="button" class="dx-back" id="dxRe">↺ 다시 점검하기</button><span></span></div></div>'

    $('dxRe').onclick = function () {
      st = { type: null, i: 0, ans: [] }
      render()
    }
    $('dxBook').onclick = function () {
      try {
        sessionStorage.setItem('hmcp_dx', JSON.stringify({ type: st.type, ans: flat }))
      } catch (e) {}
    }
  }

  // 증가된 진행 상태를 스크린리더에 알리기 위한 live region은 마크업에 존재
  render()
})()
