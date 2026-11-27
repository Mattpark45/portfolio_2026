/* 3분 점검 위젯 — 입력은 페이지 메모리에서만 쓰며 저장소·네트워크 전송을 쓰지 않는다 */
(function () {
  'use strict';
  var box = document.getElementById('dx');
  var R = window.HMCP_DX_RULES;
  if (!box || !R) return;
  var st = { type: null, i: 0, ans: [] };
  var body = box.querySelector('.dx-body');
  var bar = box.querySelector('.dx-progress span');
  var label = box.querySelector('.dx-step-label');

  function el(tag, attrs, text) { var e = document.createElement(tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function setProgress(n) { bar.style.width = (n * 25) + '%'; label.textContent = n + ' / 4'; }

  function stepType() {
    setProgress(1); body.innerHTML = '';
    body.appendChild(el('h3', {}, '누구의 상황을 점검할까요?'));
    var opts = el('div', { class: 'opts', role: 'group', 'aria-label': '점검 대상' });
    [['corp', '우리 회사'], ['family', '나와 가족']].forEach(function (o) {
      var b = el('button', { type: 'button', class: 'btn ghost' }, o[1]);
      b.addEventListener('click', function () { st.type = o[0]; st.i = 0; st.ans = []; stepQ(); });
      opts.appendChild(b);
    });
    body.appendChild(opts);
  }

  function stepQ() {
    var steps = R.steps[st.type]; var s = steps[st.i];
    setProgress(st.i + 2); body.innerHTML = '';
    body.appendChild(el('h3', {}, s.q));
    var group = el('div', { class: 'opts', role: 'group', 'aria-label': s.q });
    var name = 'dx' + st.i;
    s.opts.forEach(function (o) {
      var lab = el('label'); var inp = el('input', { type: s.single ? 'radio' : 'checkbox', name: name, value: o });
      if (st.ans[st.i] && st.ans[st.i].indexOf(o) > -1) inp.checked = true;
      lab.appendChild(inp); lab.appendChild(document.createTextNode(' ' + o)); group.appendChild(lab);
      if (s.single) inp.addEventListener('change', function () { st.ans[st.i] = [o]; next(); });
    });
    body.appendChild(group);
    var err = el('p', { class: 'dx-note', role: 'alert' }); body.appendChild(err);
    var act = el('div', { class: 'actions' });
    var back = el('button', { type: 'button', class: 'btn ghost small' }, '이전');
    back.addEventListener('click', function () { if (st.i === 0) stepType(); else { st.i--; stepQ(); } });
    act.appendChild(back);
    if (!s.single) {
      var go = el('button', { type: 'button', class: 'btn small' }, st.i === steps.length - 1 ? '결과 보기' : '다음');
      go.addEventListener('click', function () {
        var v = Array.prototype.map.call(group.querySelectorAll('input:checked'), function (x) { return x.value; });
        if (!v.length && !s.optional) { err.textContent = '하나 이상 선택해 주세요.'; return; }
        st.ans[st.i] = v; next();
      });
      act.appendChild(go);
    }
    body.appendChild(act);
  }

  function next() { if (st.i < R.steps[st.type].length - 1) { st.i++; stepQ(); } else result(); }

  function result() {
    setProgress(4); body.innerHTML = '';
    var picks = st.ans[1] || [];
    var r = R.result[picks[0]] || R.result[Object.keys(R.result)[0]];
    body.appendChild(el('h3', {}, '점검 결과'));
    var dl = el('dl', { class: 'dx-result' });
    [['k-risk', '지킬 것', r.risk], ['k-benefit', '쓸 수 있는 것', r.benefit], ['k-growth', '다음 기회', r.growth]].forEach(function (x) {
      var d = el('div'); d.appendChild(el('dt', { class: x[0] }, x[1])); d.appendChild(el('dd', {}, x[2])); dl.appendChild(d);
    });
    body.appendChild(dl);
    if (picks.length > 1) body.appendChild(el('p', { class: 'dx-note' }, '함께 선택하신 항목(' + picks.slice(1).join(', ') + ')은 상담에서 이어서 살펴볼 수 있습니다.'));
    body.appendChild(el('p', { class: 'dx-note' }, '이 결과는 선택하신 항목에 따른 일반 안내이며, 개별 진단이나 상품 권유가 아닙니다.'));
    var act = el('div', { class: 'actions' });
    var again = el('button', { type: 'button', class: 'btn ghost small' }, '다시 하기');
    again.addEventListener('click', stepType);
    var book = el('a', { class: 'btn small', href: box.getAttribute('data-contact') || 'contact/#request' }, '이 결과로 30분 상담 요청');
    act.appendChild(again); act.appendChild(book); body.appendChild(act);
  }

  stepType();
})();
