/**
 * Cursor Effects Module
 * Handles custom cursor dot effects
 */

export function initCursor() {
    const cursorDot = document.querySelector('.cursor-dot');

    if (!cursorDot) return;

    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    });

    // Scale cursor on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'scale(1)';
        });
    });
}
