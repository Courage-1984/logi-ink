/**
 * Cursor Effects Module
 * Handles custom cursor follow and dot effects
 */

export function initCursor() {
    const cursorFollow = document.querySelector('.cursor-follow');
    const cursorDot = document.querySelector('.cursor-dot');

    if (!cursorFollow || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;

        cursorFollow.style.left = cursorX + 'px';
        cursorFollow.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Hide cursor on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollow.style.transform = 'scale(1.5)';
            cursorDot.style.transform = 'scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursorFollow.style.transform = 'scale(1)';
            cursorDot.style.transform = 'scale(1)';
        });
    });
}
