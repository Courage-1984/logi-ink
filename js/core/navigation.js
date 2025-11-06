/**
 * Navigation Module
 * Handles navbar scroll effects and mobile menu toggle
 */

export function initNavigation() {
    // Navigation Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Set active nav link based on current page
    const setActiveNavLinkByPage = () => {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Remove active class first
            link.classList.remove('active');
            
            // Check if this link matches the current page
            if (href === currentPage || 
                (currentPage === '' && (href === 'index.html' || href === '/'))) {
                link.classList.add('active');
            }
        });
    };

    // Active nav link highlighting based on scroll position with scroll-based color change
    // This only updates the scroll progress for the already-active link
    const sections = document.querySelectorAll('section[id]');
    const navLinks2 = document.querySelectorAll('.nav-link');

    // Debounced scroll handler for performance
    let ticking = false;

    const updateActiveNavLink = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollPosition = window.pageYOffset;
                const windowHeight = window.innerHeight;
        let current = '';
                let activeSection = null;
                let sectionScrollProgress = 0;

                // Find the current active section
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
                    const sectionBottom = sectionTop + sectionHeight;
                    
                    // Check if section is in viewport
                    if (scrollPosition >= sectionTop - 200 && scrollPosition < sectionBottom) {
                current = section.getAttribute('id');
                        activeSection = section;
                        
                        // Calculate scroll progress within the active section
                        // Progress goes from 0% when section enters viewport to 100% when fully scrolled
                        const sectionStart = Math.max(0, sectionTop - 200);
                        const sectionEnd = sectionBottom;
                        const sectionRange = sectionEnd - sectionStart;
                        
                        if (sectionRange > 0) {
                            const scrolledInSection = Math.max(0, scrollPosition - sectionStart);
                            sectionScrollProgress = Math.min(100, (scrolledInSection / sectionRange) * 100);
                        }
            }
        });

                // Handle home page (when at top of page)
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const isHomePage = currentPage === 'index.html' || currentPage === '';
                
                if (isHomePage && scrollPosition < 100 && !current) {
                    // Use overall page scroll progress for home
                    const documentHeight = document.documentElement.scrollHeight;
                    const totalScrollRange = documentHeight - windowHeight;
                    if (totalScrollRange > 0) {
                        sectionScrollProgress = Math.min(100, (scrollPosition / totalScrollRange) * 100);
                    }
                }

                // Update scroll progress for active nav link
        navLinks2.forEach(link => {
                    // Remove scroll progress style
                    link.style.setProperty('--scroll-progress', '0%');
                    
                    // Only update scroll progress if this link is active
                    if (link.classList.contains('active')) {
                    const href = link.getAttribute('href');
                    const isHomeLink = href === 'index.html' || href === '/' || 
                                      (link.textContent && link.textContent.trim().toLowerCase() === 'home');
                    
                        // Update scroll progress for home page or section links
                    if (href === `#${current}` || 
                            (isHomeLink && isHomePage && scrollPosition < 100 && !current)) {
                        // Apply scroll-based color change from left to right (#ed12ff to cyan)
                        link.style.setProperty('--scroll-progress', `${sectionScrollProgress}%`);
                        }
            }
        });
                
                ticking = false;
            });
            
            ticking = true;
        }
    };

    // Set active link based on current page on load
    setActiveNavLinkByPage();
    
    // Update scroll progress on scroll
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    // Initial call for scroll progress
    updateActiveNavLink();
}
