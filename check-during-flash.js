// Execute IMMEDIATELY after click to catch the flash
setTimeout(() => {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  
  const state = {
    timestamp: Date.now(),
    url: window.location.href,
    navbar: {
      classes: Array.from(navbar?.classList || []),
      hasNavInitialized: navbar?.classList.contains('nav-initialized') || false,
      computedHeight: navbar ? window.getComputedStyle(navbar).height : null,
      boundingBox: navbar?.getBoundingClientRect()
    },
    navLinks: Array.from(navLinks).map(link => {
      const computed = window.getComputedStyle(link);
      const hasActive = link.classList.contains('active');
      const hasDataActiveInit = link.hasAttribute('data-active-initialized');
      const hasDataNavInit = link.hasAttribute('data-nav-initialized');
      
      return {
        text: link.textContent.trim(),
        classes: Array.from(link.classList),
        attributes: {
          dataActiveInit: hasDataActiveInit,
          dataNavInit: hasDataNavInit
        },
        computedStyles: {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          backgroundClip: computed.backgroundClip,
          webkitTextFillColor: computed.webkitTextFillColor,
          textShadow: computed.textShadow
        },
        appearsActive: computed.backgroundClip === 'text' && computed.webkitTextFillColor === 'rgba(0, 0, 0, 0)',
        hasActiveClass: hasActive,
        appearsHovered: computed.textShadow !== 'none' && computed.color !== 'rgb(176, 176, 176)'
      };
    })
  };
  
  console.log('[DURING FLASH] Navbar State:', JSON.stringify(state, null, 2));
  
  // Check which CSS rules are matching
  const testLink = navLinks[0];
  if (testLink) {
    const styles = window.getComputedStyle(testLink);
    console.log('[DURING FLASH] Test link computed styles:', {
      color: styles.color,
      backgroundClip: styles.backgroundClip,
      webkitTextFillColor: styles.webkitTextFillColor,
      textShadow: styles.textShadow,
      hasActive: testLink.classList.contains('active'),
      hasNavInitialized: navbar?.classList.contains('nav-initialized')
    });
  }
}, 0);
