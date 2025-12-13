// Phase 3: Check computed styles during navigation
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const result = {
  navbar: {
    hasNavInitialized: navbar?.classList.contains('nav-initialized') || false,
    classes: Array.from(navbar?.classList || [])
  },
  navLinks: Array.from(navLinks).slice(0, 3).map(link => {
    const computed = window.getComputedStyle(link);
    const pseudoHover = link.matches(':hover') || document.querySelector('.navbar')?.matches(':hover');
    return {
      text: link.textContent.trim(),
      classes: Array.from(link.classList),
      hasDataNavInit: link.hasAttribute('data-nav-initialized'),
      hasDataActiveInit: link.hasAttribute('data-active-initialized'),
      computedStyles: {
        color: computed.color,
        backgroundClip: computed.backgroundClip,
        webkitTextFillColor: computed.webkitTextFillColor,
        textShadow: computed.textShadow
      },
      appearsActive: computed.backgroundClip !== 'border-box' && computed.webkitTextFillColor === 'rgba(0, 0, 0, 0)',
      appearsHovered: computed.textShadow !== 'none' && computed.textShadow !== ''
    };
  })
};
JSON.stringify(result, null, 2);
