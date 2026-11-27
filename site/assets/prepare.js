/* 상담 준비 질문 — 입력은 이 페이지 메모리에서만 쓰이며 브라우저 저장소·네트워크 전송을 쓰지 않는다 */
(function () {
  'use strict';
  var root = document.getElementById('questions');
  if (!root) return;
  var out = document.getElementById('summary-text');
  var mail = document.getElementById('mail-btn');
  var status = document.getElementById('status');

  function kind() { var r = root.querySelector('input[name="kind"]:checked'); return r ? r.value : 'individual'; }
  function picked(name) {
    var box = root.querySelector('[data-name="' + name + '"]');
    if (!box) return '';
    return Array.prototype.map.call(box.querySelectorAll('input:checked'), function (i) { return i.value; }).join(', ');
  }
  function text(name) { var t = root.querySelector('textarea[data-name="' + name + '"]'); return t ? t.value.trim() : ''; }

  function build() {
    var k = kind();
    var rows = [];
    function add(label, v) { if (v) rows.push('■ ' + label + '\n  ' + v); }
    if (k === 'individual') {
      add('상담 종류', '개인·가족 재무상담');
      add('지금 시기', picked('stage'));
      add('원하는 모습(5년 뒤)', text('goal'));
      add('잘 되어 있는 것', text('strength'));
      add('걱정되는 것', picked('worry'));
    } else {
      add('상담 종류', '기업·경영자 경영상담');
      add('회사 규모(연매출)', picked('size'));
      add('내년 목표', text('goal_b'));
      add('회사의 강점', text('strength_b'));
      add('중요한 과제', picked('issue'));
      add('결정 시점', picked('when'));
    }
    add('이번 상담에서 정할 것', picked('want'));
    return rows.length > 1 ? rows.join('\n\n') : '왼쪽 질문에 답하시면 여기에 요약이 만들어집니다.';
  }

  function render() {
    var k = kind();
    root.querySelectorAll('[data-kind]').forEach(function (el) { el.hidden = el.getAttribute('data-kind') !== k; });
    var s = build();
    out.textContent = s;
    var body = '[Human MCP 상담 준비 요약]\n\n' + s + '\n\n희망 일정(2~3개 후보): \n';
    if (body.length > 1800) body = body.slice(0, 1800) + '…';
    mail.setAttribute('href', 'mailto:dhp.cfo@gmail.com?subject=' + encodeURIComponent('[Human MCP] 상담 준비 요약') + '&body=' + encodeURIComponent(body));
  }

  root.addEventListener('input', render);
  root.addEventListener('change', render);

  document.getElementById('copy-btn').addEventListener('click', function () {
    var s = out.textContent;
    var done = function () { status.textContent = '요약을 복사했습니다. 메일이나 메시지에 붙여 넣어 보내 주세요.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(done, function () { status.textContent = '복사하지 못했습니다. 요약을 직접 선택해 복사해 주세요.'; });
    } else {
      status.textContent = '이 브라우저는 자동 복사를 지원하지 않습니다. 요약을 직접 선택해 복사해 주세요.';
    }
  });

  render();
})();
