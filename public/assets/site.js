/* Human MCP — 디지털 영업지점 공통 스크립트 (의존성 없음) */
(function () {
  'use strict';

  // ── 설정: 여기 한 곳만 바꾸면 전 페이지에 반영됩니다 ──────────────
  // Google 캘린더 "예약 일정(Appointment schedule)"의 공개 예약 페이지 URL을 넣으세요.
  // 예: https://calendar.app.google/xxxxxxxx
  // 비어 있으면 예약 버튼은 연락처 페이지(전화·이메일)로 안내합니다. 가짜 예약 화면을 띄우지 않습니다.
  var BOOKING_URL = '';

  var bookingReady = /^https:\/\/(calendar\.app\.google|calendar\.google\.com)\//.test(BOOKING_URL);

  document.querySelectorAll('[data-booking]').forEach(function (a) {
    if (bookingReady) {
      a.setAttribute('href', BOOKING_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    } else {
      a.setAttribute('href', '/contact/#request');
    }
  });
  document.querySelectorAll('[data-booking-ready]').forEach(function (el) { el.hidden = !bookingReady; });
  document.querySelectorAll('[data-booking-pending]').forEach(function (el) { el.hidden = bookingReady; });

  // 모바일 메뉴
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // 현재 페이지 표시
  var here = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('#site-nav a[href]').forEach(function (a) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
