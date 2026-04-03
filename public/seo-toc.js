/* seo-toc.js — Table of Contents active state tracking */
(function () {
  const tocItems  = document.querySelectorAll('.seo-toc-item');
  const sections  = document.querySelectorAll('.seo-section[id]');
  const activeBar = document.querySelector('.seo-toc-active-bar');

  function update() {
    let current = sections[0];
    sections.forEach(s => {
      if (s.getBoundingClientRect().top <= 100) current = s;
    });

    tocItems.forEach((item, i) => {
      const isActive = item.getAttribute('href') === '#' + current.id;
      item.classList.toggle('active', isActive);
      if (isActive && activeBar) {
        activeBar.style.top = (i * 36) + 'px';
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
