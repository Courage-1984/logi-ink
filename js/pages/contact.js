/**
 * Contact Page Module
 * Handles contact form submission
 */

export function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add your form submission logic here
        // Example: Send to Formspree, Netlify Forms, or custom API
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}
