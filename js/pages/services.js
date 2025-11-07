/**
 * Services Page Module
 * Handles service modal open/close functionality
 */

export function initServiceModals() {
  // Get all service modal buttons
  const modalButtons = document.querySelectorAll('.service-modal-btn');
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.modal-close');

  // Open modal when button is clicked
  modalButtons.forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const card = button.closest('.service-card-square');
      if (card) {
        const modalId = card.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
      }
    });
  });

  // Close modal when close button is clicked
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
  });

  // Close modal when clicking outside the modal content
  modals.forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
  });

  // Close modal with Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('active')) {
          modal.classList.remove('active');
          document.body.style.overflow = ''; // Restore scrolling
        }
      });
    }
  });
}
