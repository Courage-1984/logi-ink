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

    // Active nav link highlighting based on scroll position with scroll-based color change
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
                if (scrollPosition < 100 && !current) {
                    // Use overall page scroll progress for home
                    const documentHeight = document.documentElement.scrollHeight;
                    const totalScrollRange = documentHeight - windowHeight;
                    if (totalScrollRange > 0) {
                        sectionScrollProgress = Math.min(100, (scrollPosition / totalScrollRange) * 100);
                    }
                }

        navLinks2.forEach(link => {
            link.classList.remove('active');
                    // Remove scroll progress style
                    link.style.setProperty('--scroll-progress', '0%');
                    
                    const href = link.getAttribute('href');
                    const isHomeLink = href === 'index.html' || href === '/' || 
                                      (link.textContent && link.textContent.trim().toLowerCase() === 'home');
                    
                    if (href === `#${current}` || 
                        (isHomeLink && scrollPosition < 100 && !current)) {
                link.classList.add('active');
                        // Apply scroll-based color change from left to right (#ed12ff to cyan)
                        link.style.setProperty('--scroll-progress', `${sectionScrollProgress}%`);
            }
        });
                
                ticking = false;
            });
            
            ticking = true;
        }
    };

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    // Initial call
    updateActiveNavLink();
}
