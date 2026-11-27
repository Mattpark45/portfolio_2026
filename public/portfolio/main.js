// 모바일 햄버거 토글
const toggle = document.getElementById('mobileToggle');
const sidenav = document.getElementById('sidenav');
toggle.addEventListener('click', () => {
  sidenav.classList.toggle('open');
  toggle.classList.toggle('active');
});

// 링크 클릭 시 모바일 메뉴 닫기
document.querySelectorAll('.sidenav-list a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 1024) {
      sidenav.classList.remove('open');
      toggle.classList.remove('active');
    }
  });
});

// 스크롤 위치에 따른 현재 섹션 active
const sections = document.querySelectorAll('.sec');
const navLinks = document.querySelectorAll('.sidenav-list a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    const top = s.offsetTop - 200;
    if (window.scrollY >= top) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.remove('active');
    if (l.getAttribute('href') === '#' + current) l.classList.add('active');
  });
});
