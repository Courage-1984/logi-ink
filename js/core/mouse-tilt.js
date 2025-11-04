/**
 * Mouse Tilt Module
 * Handles 3D tilt effects on interactive cards (desktop only)
 */

export function initMouseTilt() {
    // Only enable on devices with hover capability (desktop)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        return;
    }

    const tiltElements = document.querySelectorAll('.mouse-tilt-container');

    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            // Check if element has specific hover transform classes
            if (element.classList.contains('service-card')) {
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) translateZ(20px)`;
            } else if (element.classList.contains('project-card') || element.classList.contains('project-card-large')) {
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) translateZ(15px)`;
            } else {
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            }
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        });
    });
}
