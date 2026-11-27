// Human MCP — Article 목차 scroll-spy
(function () {
  var links = [].slice.call(document.querySelectorAll('.toc a[href^="#"]'))
  if (!links.length || !('IntersectionObserver' in window)) return

  var targets = links
    .map(function (l) {
      return document.querySelector(l.getAttribute('href'))
    })
    .filter(Boolean)
  if (!targets.length) return

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return
        links.forEach(function (l) {
          l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id)
        })
      })
    },
    { rootMargin: '-20% 0px -70% 0px' }
  )
  targets.forEach(function (t) { io.observe(t) })
})()
