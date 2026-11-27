// Human MCP — 상담 요청 4단계 (sessionStorage 유지, 서버 저장 없음)
// 실제 일정 연동 전: 희망 일정을 받아 사용자의 메일 앱으로 요청 메일을 작성한다. 일정은 회신으로 확정.
(function () {
  // 메일 앱 열기 (시험에서는 window.HMCP_OPEN 으로 가로챔)
  function open_(u) {
    if (typeof window.HMCP_OPEN === 'function') return window.HMCP_OPEN(u)
    location.href = u
  }
  var TYPES = {
    personal: ['개인·가족 재무상담', '재무계획 · 보장 · 연금 · 은퇴'],
    corp: ['기업 경영자문 상담', '경영과제 · 세무 리스크 · 성장 · 자본'],
    ax: ['AI/AX 및 교육 문의', 'AX 진단 · PoC · 임직원 교육'],
    partner: ['전문가 협업 · 제휴', '전문서비스 · 투자자 · 기술기업'],
  }
  var TOPICS = {
    personal: ['재무계획 전반', '보장 점검', '연금·은퇴', '자녀·교육자금', '부동산·세금', '상속·증여'],
    corp: ['세무 리스크', '가지급금', '가업승계', '정책자금·인증', '노무', '투자유치·M&A', '해외진출', '비용절감'],
    ax: ['AX 진단', 'AI 도입 PoC', '임직원 교육', '기술 협업'],
    partner: ['세무·법률 등 전문서비스', '투자·금융기관', '기술기업', '교육기관', '공동사업'],
  }
  var SLOTS = ['10:00', '11:00', '13:30', '15:00', '16:30', '19:00']
  var KEY = 'hmcp_booking'

  var P = document.getElementById('panel')
  var STEP_EL = document.getElementById('steps')
  if (!P || !STEP_EL) return

  var qs = new URLSearchParams(location.search)

  // 희망 일정 후보: 다음 평일 10일 (실제 가능 여부는 회신으로 확정)
  var DAYS = (function () {
    var out = []
    var d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 1)
    var W = ['일', '월', '화', '수', '목', '금', '토']
    while (out.length < 10) {
      if (d.getDay() % 6 !== 0) {
        out.push({
          k: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
          w: W[d.getDay()],
          n: d.getDate(),
          m: d.getMonth() + 1,
          off: false,
        })
      }
      d.setDate(d.getDate() + 1)
    }
    return out
  })()

  // 마감 시간 (캘린더 연동 시 구현)
  function taken(k) {
    return [] // 캘린더 연동 전에는 마감 표시를 하지 않는다
  }

  var saved = null
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch (e) {}

  var S =
    saved || {
      step: 0,
      type: qs.get('type') || null,
      topics: qs.get('topic') ? [qs.get('topic')] : [],
      note: '',
      day: null,
      slot: null,
      mode: 'online',
      name: '',
      tel: '',
      email: '',
      company: '',
      c1: false,
      c2: false,
      c3: false,
    }

  if (qs.get('type') && S.step === 0 && S.type) S.step = 1

  // 3분 점검 결과 연동
  var dx = null
  try {
    dx = JSON.parse(sessionStorage.getItem('hmcp_dx') || 'null')
  } catch (e) {}
  if (dx && !S.type) {
    S.type = dx.type === 'corp' ? 'corp' : 'personal'
    S.topics = []
    S.step = 1
    S.note = '3분 점검에서 고른 항목: ' + (dx.ans || []).join(', ')
  }

  var forced = null

  function save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(S))
    } catch (e) {}
  }

  function stepsUI() {
    ;[].slice.call(STEP_EL.children).forEach(function (l, i) {
      l.className = i < S.step ? 'done' : i === S.step ? 'on' : ''
      l.setAttribute('aria-current', i === S.step ? 'step' : 'false')
    })
  }

  function nav(canNext, label) {
    return (
      '<div class="nav-b">' +
      (S.step > 0 ? '<button class="back" type="button" data-a="back">← 이전</button>' : '<span></span>') +
      '<button class="btn btn-primary" type="button" data-a="next"' +
      (canNext ? '' : ' disabled') +
      '>' +
      (label || '다음') +
      '</button></div>'
    )
  }

  function render() {
    stepsUI()
    save()
    var T = document.getElementById('bkTitle')

    if (S.step === 4) return renderDone()

    if (S.step === 0) {
      T.textContent = '어떤 상담이 필요하신가요?'
      P.innerHTML =
        '<h2>상담 종류</h2><p class="hint">가장 가까운 것을 골라 주세요. 나중에 바꿀 수 있습니다.</p>' +
        '<div class="opts" role="radiogroup" aria-label="상담 종류">' +
        Object.keys(TYPES)
          .map(function (k) {
            return (
              '<button class="opt" type="button" role="radio" aria-checked="' +
              (S.type === k) +
              '" data-type="' +
              k +
              '"><b>' +
              TYPES[k][0] +
              '</b><small>' +
              TYPES[k][1] +
              '</small></button>'
            )
          })
          .join('') +
        '</div>' +
        nav(!!S.type)
      return
    }

    if (S.step === 1) {
      T.textContent = TYPES[S.type] ? TYPES[S.type][0] : '상담 목적'
      P.innerHTML =
        (dx
          ? '<div class="from-dx"><b>3분 점검 결과</b><span>점검에서 고르신 항목을 상담 메모에 함께 담았습니다. 원치 않으시면 지워 주세요.</span></div>'
          : '') +
        '<h2>무엇을 이야기하고 싶으세요?</h2><p class="hint">여러 개 골라도 됩니다. 선택하지 않으셔도 괜찮습니다.</p>' +
        '<div class="chips">' +
        (TOPICS[S.type] || [])
          .map(function (t) {
            return (
              '<button class="chip" type="button" aria-pressed="' +
              (S.topics.indexOf(t) > -1) +
              '" data-topic="' +
              t +
              '">' +
              t +
              '</button>'
            )
          })
          .join('') +
        '</div>' +
        '<div class="f" style="margin-top:24px"><label for="note">미리 전하고 싶은 말 <small>(선택)</small></label>' +
        '<textarea id="note" placeholder="예) 내년에 법인전환을 고민 중입니다.">' +
        S.note +
        '</textarea>' +
        '<p style="font-size:13px;color:var(--char-2);margin-top:6px">주민번호, 계좌, 건강정보, 금융계약 내용은 적지 말아 주세요.</p></div>' +
        nav(true)
      return
    }

    if (S.step === 2) {
      T.textContent = '희망 시간을 골라 주세요'
      var d = DAYS.filter(function (x) {
        return x.k === S.day
      })[0]
      var slotsHTML

      if (forced === 'slots-loading') {
        slotsHTML = '<div class="slots">' + new Array(6).join('<div class="skel"></div>') + '</div>'
      } else if (forced === 'slots-empty' || (d && d.off)) {
        slotsHTML =
          '<div class="empty">이 날은 예약 가능한 시간이 없습니다.<br>다른 날을 골라 주시거나 <a href="mailto:dhp.cfo@gmail.com">이메일</a>로 시간을 제안해 주세요.</div>'
      } else if (!S.day) {
        slotsHTML = '<div class="empty">왼쪽에서 날짜를 먼저 골라 주세요.</div>'
      } else {
        slotsHTML =
          '<div class="slots">' +
          SLOTS.map(function (s) {
            var off = taken(S.day).indexOf(s) > -1
            return (
              '<button class="slot" type="button" data-slot="' +
              s +
              '" aria-pressed="' +
              (S.slot === s) +
              '"' +
              (off ? ' disabled aria-label="' + s + ' 예약 마감"' : '') +
              '>' +
              s +
              '</button>'
            )
          }).join('') +
          '</div>'
      }

      P.innerHTML =
        '<h2>희망 일정</h2><p class="hint">30분 상담 · 한국 시간 기준 · 실제 일정은 회신으로 확정합니다 · ' +
        (DAYS[0] ? DAYS[0].m : '') +
        '월~' +
        (DAYS[DAYS.length - 1] ? DAYS[DAYS.length - 1].m : '') +
        '월</p>' +
        '<div class="cal"><div><div class="lbl-s" id="lbl-day">날짜</div><div class="days" role="group" aria-labelledby="lbl-day">' +
        DAYS.map(function (x) {
          return (
            '<button class="day" type="button" data-day="' +
            x.k +
            '" aria-pressed="' +
            (S.day === x.k) +
            '"><small>' +
            x.m +
            '/' +
            x.w +
            '</small><b>' +
            x.n +
            '</b></button>'
          )
        }).join('') +
        '</div></div>' +
        '<div><div class="lbl-s" id="lbl-slot">시간</div>' +
        slotsHTML +
        '<div class="lbl-s" style="margin-top:22px" id="lbl-mode">방식</div><div class="mode" role="group" aria-labelledby="lbl-mode">' +
        '<button class="chip" type="button" data-mode="online" aria-pressed="' +
        (S.mode === 'online') +
        '">화상</button>' +
        '<button class="chip" type="button" data-mode="phone" aria-pressed="' +
        (S.mode === 'phone') +
        '">전화</button>' +
        '<button class="chip" type="button" data-mode="visit" aria-pressed="' +
        (S.mode === 'visit') +
        '">방문 (부산·울산·경남)</button>' +
        '</div></div></div>' +
        nav(!!(S.day && S.slot))
      return
    }

    if (S.step === 3) {
      T.textContent = '거의 다 됐습니다'
      var corp = S.type === 'corp' || S.type === 'partner' || S.type === 'ax'
      P.innerHTML =
        '<h2>연락처</h2><p class="hint">상담 일정 안내에만 사용합니다. 입력 내용은 서버에 저장되지 않고 메일 본문으로만 옮겨집니다.</p>' +
        '<form id="fm" novalidate>' +
        '<div class="row2">' +
        '<div class="f" id="f-name"><label for="name">이름</label><input type="text" id="name" autocomplete="name" value="' +
        S.name +
        '"><p class="err">이름을 적어 주세요.</p></div>' +
        '<div class="f" id="f-tel"><label for="tel">휴대전화</label><input type="tel" id="tel" autocomplete="tel" inputmode="tel" placeholder="010-0000-0000" value="' +
        S.tel +
        '"><p class="err">연락 가능한 번호를 적어 주세요. 예) 010-1234-5678</p></div>' +
        '</div><div class="row2">' +
        '<div class="f"><label for="email">이메일 <small>(선택)</small></label><input type="email" id="email" autocomplete="email" value="' +
        S.email +
        '"></div>' +
        (corp
          ? '<div class="f"><label for="company">회사·기관명 <small>(선택)</small></label><input type="text" id="company" autocomplete="organization" value="' +
            S.company +
            '"></div>'
          : '<div></div>') +
        '</div>' +
        '<div class="consent" role="group" aria-label="동의">' +
        '<label><input type="checkbox" id="c1" ' +
        (S.c1 ? 'checked' : '') +
        '><span>[필수] 개인정보 수집·이용 동의<small>이름·연락처 · 상담 예약 및 안내 목적 · 상담 종료 후 1년 보관</small></span></label>' +
        '<label><input type="checkbox" id="c2" ' +
        (S.c2 ? 'checked' : '') +
        '><span>[필수] 업무 범위 안내 확인<small>세무·법률 등 자격 업무는 협업 전문가가 수행합니다.</small></span></label>' +
        '<label><input type="checkbox" id="c3" ' +
        (S.c3 ? 'checked' : '') +
        '><span>[선택] 격주 브리핑 이메일 받기<small>언제든 해지할 수 있습니다.</small></span></label>' +
        '</div>' +
        '<div class="alert-e" id="sendErr" role="alert"><b>!</b><span>예약을 보내지 못했습니다. 입력하신 내용은 그대로 있으니 잠시 후 다시 눌러 주세요. 계속 안 되면 dhp.cfo@gmail.com으로 알려 주세요.</span></div>' +
        '</form>' +
        nav(S.c1 && S.c2, '요청 메일 작성하기') +
        '<p style="font-size:13px;color:var(--char-2);margin-top:12px">버튼을 누르면 메일 앱이 열립니다. 보내기를 누르셔야 요청이 전달되며, 일정은 회신으로 확정합니다.</p>'

      var g = function (id) {
        return document.getElementById(id)
      }
      var sync = function () {
        S.name = g('name').value
        S.tel = g('tel').value
        S.email = g('email').value
        if (g('company')) S.company = g('company').value
        S.c1 = g('c1').checked
        S.c2 = g('c2').checked
        S.c3 = g('c3').checked
        save()
        var nb = P.querySelector('[data-a=next]')
        if (nb) nb.disabled = !(S.c1 && S.c2)
      }
      ;[].slice.call(P.querySelectorAll('input')).forEach(function (i) {
        i.addEventListener('input', sync)
        i.addEventListener('change', sync)
      })
      return
    }
  }

  function renderDone() {
    document.getElementById('bkTitle').textContent = '요청 메일을 작성했습니다'
    ;[].slice.call(STEP_EL.children).forEach(function (l) {
      l.className = 'done'
    })
    var d =
      DAYS.filter(function (x) {
        return x.k === S.day
      })[0] || DAYS[1]
    P.innerHTML =
      '<div class="done"><div class="ok" aria-hidden="true">✓</div><h2>' +
      (S.name || '고객') +
      '님, 메일 앱에서 보내기를 눌러 주세요.</h2><p style="color:var(--char-2)">메일이 전달되면 영업일 기준 1~2일 안에 일정을 회신드립니다. 메일 앱이 열리지 않았다면 아래 내용을 <a href="mailto:dhp.cfo@gmail.com">dhp.cfo@gmail.com</a> 또는 <a href="https://talk.naver.com/ct/wlxk5xa" target="_blank" rel="noopener">네이버 톡톡</a>으로 보내 주세요.</p>' +
      '<dl><dt>희망 상담</dt><dd>' +
      (TYPES[S.type || 'personal'] ? TYPES[S.type || 'personal'][0] : '') +
      '</dd><dt>희망 일정</dt><dd>' +
      d.m +
      '월 ' +
      d.n +
      '일 (' +
      d.w +
      ') ' +
      (S.slot || '11:00') +
      ' · 30분</dd><dt>방식</dt><dd>' +
      { online: '화상', phone: '전화', visit: '방문' }[S.mode] +
      '</dd>' +
      (S.topics.length ? '<dt>이야기할 것</dt><dd>' + S.topics.join(', ') + '</dd>' : '') +
      '</dl>' +
      '<h3 style="font:600 16px var(--f-sans);margin-bottom:10px">상담 전에 해 두시면 좋은 것</h3>' +
      '<ol><li>지금 가장 궁금한 질문 한두 가지를 적어 두세요.</li>' +
      (S.type === 'corp'
        ? '<li>최근 재무제표가 있으면 준비해 주세요. 없어도 괜찮습니다.</li>'
        : '<li>매달 고정으로 나가는 돈을 대략 떠올려 보세요.</li>') +
      '<li>일정을 바꾸려면 회신 메일에 답장해 주세요.</li></ol>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:28px"><a class="btn btn-primary" href="https://calendar.app.google/rPdCuE4tpyLSZ9p97" target="_blank" rel="noopener">Google 캘린더에서 바로 예약 ↗</a><a class="btn btn-secondary" href="/intelligence">관련 글 읽어 보기</a><a class="btn btn-secondary" href="/">홈으로</a></div></div>'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  P.addEventListener('click', function (e) {
    var b = e.target.closest('button')
    if (!b) return

    if (b.dataset.type) {
      if (S.type !== b.dataset.type) S.topics = []
      S.type = b.dataset.type
      render()
      return
    }
    if (b.dataset.topic) {
      var t = b.dataset.topic
      var i = S.topics.indexOf(t)
      if (i > -1) S.topics.splice(i, 1)
      else S.topics.push(t)
      b.setAttribute('aria-pressed', String(i < 0))
      save()
      return
    }
    if (b.dataset.day) {
      S.day = b.dataset.day
      S.slot = null
      forced = null
      render()
      return
    }
    if (b.dataset.slot) {
      S.slot = b.dataset.slot
      render()
      return
    }
    if (b.dataset.mode) {
      S.mode = b.dataset.mode
      render()
      return
    }
    if (b.dataset.a === 'back') {
      var n0 = document.getElementById('note')
      if (n0) S.note = n0.value
      S.step--
      forced = null
      render()
      return
    }
    if (b.dataset.a === 'next') {
      var n = document.getElementById('note')
      if (n) S.note = n.value

      if (S.step === 3) {
        var ok = true
        var fn = document.getElementById('f-name')
        var ft = document.getElementById('f-tel')
        fn.classList.toggle('invalid', !S.name.trim())
        ok = ok && !!S.name.trim()
        var telOk = /^01[0-9]-?\d{3,4}-?\d{4}$/.test(S.tel.trim())
        ft.classList.toggle('invalid', !telOk)
        ok = ok && telOk
        if (!ok) {
          ;(fn.classList.contains('invalid') ? document.getElementById('name') : document.getElementById('tel')).focus()
          return
        }
        b.disabled = true
        b.innerHTML = '<span class="spin"></span> 보내는 중…'

        // 서버 전송 없음: 요청 내용을 메일 본문으로 만들어 메일 앱을 연다
        var dd = DAYS.filter(function (x) { return x.k === S.day })[0]
        var lines = [
          '[Human MCP 상담 요청]',
          '희망 상담: ' + (TYPES[S.type || 'personal'] ? TYPES[S.type || 'personal'][0] : ''),
          '희망 일정: ' + (dd ? dd.m + '월 ' + dd.n + '일 (' + dd.w + ') ' : '') + (S.slot || '') + ' · 30분',
          '방식: ' + ({ online: '화상', phone: '전화', visit: '방문' }[S.mode] || ''),
          S.topics.length ? '이야기할 것: ' + S.topics.join(', ') : '',
          S.note ? '메모: ' + S.note : '',
          '',
          '이름: ' + S.name,
          '연락처: ' + S.tel,
          S.email ? '이메일: ' + S.email : '',
          S.company ? '회사: ' + S.company : '',
          '',
          '(주민번호·계좌·건강정보·금융계약 상세는 적지 말아 주세요.)'
        ].filter(function (x, i, a) { return x !== '' || (a[i - 1] && a[i - 1] !== '') })
        open_(
          'mailto:dhp.cfo@gmail.com?subject=' + encodeURIComponent('[상담 요청] ' + S.name) +
          '&body=' + encodeURIComponent(lines.join('\n')))
        S.step = 4
        render()
        return
      }
      S.step++
      forced = null
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  render()
})()
