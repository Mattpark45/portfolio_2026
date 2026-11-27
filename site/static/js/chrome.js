// Human MCP — header drawer + jump nav scroll-spy
(function () {
  var drawer = document.getElementById('drawer')
  var menuBtn = document.querySelector('.menu-btn')

  function setDrawer(open) {
    if (!drawer || !menuBtn) return
    drawer.classList.toggle('open', open)
    menuBtn.setAttribute('aria-expanded', String(open))
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      var first = drawer.querySelector('a, button')
      if (first) first.focus()
    } else {
      menuBtn.focus()
    }
  }

  if (drawer && menuBtn) {
    menuBtn.addEventListener('click', function () {
      setDrawer(true)
    })
    var closeBtn = drawer.querySelector('.x')
    if (closeBtn) closeBtn.addEventListener('click', function () {
      setDrawer(false)
    })
    drawer.querySelectorAll('nav a, .btn').forEach(function (a) {
      a.addEventListener('click', function () {
        setDrawer(false)
      })
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false)
      // Focus trap
      if (e.key === 'Tab' && drawer.classList.contains('open')) {
        var f = drawer.querySelectorAll('a[href], button:not([disabled])')
        if (!f.length) return
        var first = f[0]
        var last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    })
  }

  // Jump nav scroll spy
  var jumpLinks = [].slice.call(document.querySelectorAll('.jump a[href^="#"]'))
  if (jumpLinks.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            jumpLinks.forEach(function (a) {
              a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)
            })
          }
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    jumpLinks.forEach(function (a) {
      var t = document.querySelector(a.getAttribute('href'))
      if (t) io.observe(t)
    })
  }
})()
