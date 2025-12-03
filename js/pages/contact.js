/**
 * Contact Page Module
 * Handles contact form submission, validation, localStorage, and all form interactions
 */

import { showToast } from '../utils/toast.js';
import { isDevelopmentEnv } from '../utils/env.js';

// Form state
const formData = {};
const FORM_STORAGE_KEY = 'logi-ink-contact-form';
const MAX_MESSAGE_LENGTH = 1000;

/**
 * Initialize contact form functionality
 */
export function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) {
    return;
  }

  // Load saved form data
  loadFormData();

  // Initialize form elements
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const subjectInput = document.getElementById('subject');
  const messageTextarea = document.getElementById('message');
  const submitButton = document.getElementById('submitButton');
  const progressBar = document.getElementById('formProgressBar');

  // Real-time validation
  nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
  nameInput.addEventListener('input', () => {
    clearError(nameInput, 'name');
    saveFormData();
    updateProgress();
  });

  emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
  emailInput.addEventListener('input', () => {
    clearError(emailInput, 'email');
    saveFormData();
    updateProgress();
  });

  phoneInput.addEventListener('blur', () => validateField(phoneInput, 'phone'));
  phoneInput.addEventListener('input', () => {
    clearError(phoneInput, 'phone');
    saveFormData();
    updateProgress();
  });

  subjectInput.addEventListener('blur', () => validateField(subjectInput, 'subject'));
  subjectInput.addEventListener('input', () => {
    clearError(subjectInput, 'subject');
    saveFormData();
    updateProgress();
  });

  messageTextarea.addEventListener('blur', () => validateField(messageTextarea, 'message'));
  messageTextarea.addEventListener('input', () => {
    clearError(messageTextarea, 'message');
    updateCharacterCounter();
    saveFormData();
    updateProgress();
  });

  // Form submission
  contactForm.addEventListener('submit', handleSubmit);

  // Smooth scroll to form
  initSmoothScroll();

  // Initialize progress bar
  updateProgress();

  // Initialize interactive map toggle
  initMapInteractionToggle();

  // Initialize typing animations for testimonials
  initTestimonialTyping();
}

/**
 * Validate a single form field
 */
function validateField(field, fieldName) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  let isValid = true;
  let errorMessage = '';

  // Remove previous error state
  field.closest('.form-group').classList.remove('error', 'success');

  // Check required fields
  if (field.hasAttribute('required') && !field.value.trim()) {
    isValid = false;
    errorMessage = `${getFieldLabel(fieldName)} is required`;
  }

  // Email validation
  if (fieldName === 'email' && field.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }

  // Phone validation (optional but if provided, should be valid)
  if (fieldName === 'phone' && field.value.trim()) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(field.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }
  }

  // Message length validation
  if (fieldName === 'message' && field.value.trim()) {
    if (field.value.length > MAX_MESSAGE_LENGTH) {
      isValid = false;
      errorMessage = `Message must be less than ${MAX_MESSAGE_LENGTH} characters`;
    }
  }

  // Display error or success
  if (!isValid) {
    field.closest('.form-group').classList.add('error');
    errorElement.textContent = errorMessage;
    errorElement.setAttribute('role', 'alert');
    field.setAttribute('aria-invalid', 'true');
  } else if (field.value.trim()) {
    field.closest('.form-group').classList.add('success');
    errorElement.textContent = '';
    field.setAttribute('aria-invalid', 'false');
  } else {
    errorElement.textContent = '';
    field.setAttribute('aria-invalid', 'false');
  }

  return isValid;
}

/**
 * Clear error for a field
 */
function clearError(field, fieldName) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  field.closest('.form-group').classList.remove('error');
  errorElement.textContent = '';
  field.setAttribute('aria-invalid', 'false');
}

/**
 * Get field label for error messages
 */
function getFieldLabel(fieldName) {
  const labels = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    subject: 'Subject',
    message: 'Message',
  };
  return labels[fieldName] || fieldName;
}

/**
 * Update character counter for message textarea
 */
function updateCharacterCounter() {
  const messageTextarea = document.getElementById('message');
  const countElement = document.getElementById('message-count');
  if (!messageTextarea || !countElement) {
    return;
  }

  const count = messageTextarea.value.length;
  countElement.textContent = count;

  // Update counter color based on length
  const counter = document.getElementById('message-counter');
  if (count > MAX_MESSAGE_LENGTH * 0.9) {
    counter.style.color = 'var(--accent-pink)';
  } else if (count > MAX_MESSAGE_LENGTH * 0.7) {
    counter.style.color = 'var(--accent-magenta)';
  } else {
    counter.style.color = 'var(--text-secondary)';
  }
}

/**
 * Update form progress bar
 */
function updateProgress() {
  const progressBar = document.getElementById('formProgressBar');
  if (!progressBar) {
    return;
  }

  const fields = ['name', 'email', 'subject', 'message'];
  let filledCount = 0;

  fields.forEach(fieldName => {
    const field = document.getElementById(fieldName);
    if (field && field.value.trim()) {
      filledCount++;
    }
  });

  const progress = (filledCount / fields.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute('aria-valuenow', progress);
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitButton = document.getElementById('submitButton');
  const submitText = submitButton.querySelector('.submit-text');
  const submitSpinner = submitButton.querySelector('.submit-spinner');

  // Check honeypot field
  const honeypot = document.getElementById('website');
  if (honeypot && honeypot.value) {
    // Bot detected - silently fail
    showToast('Submission failed. Please try again.', 'error');
    return;
  }

  // Validate all fields
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageTextarea = document.getElementById('message');

  const isNameValid = validateField(nameInput, 'name');
  const isEmailValid = validateField(emailInput, 'email');
  const isSubjectValid = validateField(subjectInput, 'subject');
  const isMessageValid = validateField(messageTextarea, 'message');

  if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
    showToast('Please fix the errors in the form before submitting.', 'error');
    // Focus first invalid field
    if (!isNameValid) {
      nameInput.focus();
    } else if (!isEmailValid) {
      emailInput.focus();
    } else if (!isSubjectValid) {
      subjectInput.focus();
    } else if (!isMessageValid) {
      messageTextarea.focus();
    }
    return;
  }

  // Show loading state
  submitButton.disabled = true;
  submitText.style.opacity = '0';
  submitSpinner.style.display = 'block';
  submitSpinner.style.opacity = '1';

  // Collect form data
  const formData = new FormData(form);

  try {
    // Submit form to Formspree
    await submitForm(formData);

    // Success
    showToast('Thank you for your message! We will get back to you soon.', 'success', 5000);
    form.reset();
    clearFormData();
    updateProgress();
    updateCharacterCounter();

    // Announce success to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Form submitted successfully';
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  } catch (error) {
    // Error handling with better user feedback
    const errorMessage =
      error?.message || 'There was an error submitting your message. Please try again or contact us directly.';

    showToast(errorMessage, 'error', 7000);

    // Log error for debugging (only in development)
    if (isDevelopmentEnv()) {
      console.error('[Contact Form] Submission error:', error);
    }

    // Focus first field to help user retry
    setTimeout(() => {
      nameInput?.focus();
    }, 100);
  } finally {
    // Reset loading state
    submitButton.disabled = false;
    submitText.style.opacity = '1';
    submitSpinner.style.opacity = '0';
    setTimeout(() => {
      submitSpinner.style.display = 'none';
    }, 300);
  }
}

/**
 * Submit form data to Formspree
 */
async function submitForm(formData) {
  const response = await fetch('https://formspree.io/f/mkgdbljg', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    // Try to get error message from Formspree response
    let errorMessage = 'Form submission failed. Please try again.';
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If response isn't JSON, use default message
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result;
}

/**
 * Save form data to localStorage
 */
function saveFormData() {
  const form = document.getElementById('contactForm');
  if (!form) {
    return;
  }

  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value,
  };

  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // localStorage unavailable - silently fail
  }
}

/**
 * Load form data from localStorage
 */
function loadFormData() {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.name) {
        document.getElementById('name').value = data.name;
      }
      if (data.email) {
        document.getElementById('email').value = data.email;
      }
      if (data.phone) {
        document.getElementById('phone').value = data.phone;
      }
      if (data.subject) {
        document.getElementById('subject').value = data.subject;
      }
      if (data.message) {
        document.getElementById('message').value = data.message;
      }

      // Update UI
      updateProgress();
      updateCharacterCounter();
    }
  } catch (error) {
    // localStorage unavailable - silently fail
  }
}

/**
 * Clear form data from localStorage
 */
function clearFormData() {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    // localStorage unavailable - silently fail
  }
}

/**
 * Initialize smooth scroll to form
 */
function initSmoothScroll() {
  const scrollButtons = document.querySelectorAll('.scroll-to-form');
  scrollButtons.forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById('contactSection');
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        // Focus first form field for accessibility
        setTimeout(() => {
          const firstInput = document.getElementById('name');
          if (firstInput) {
            firstInput.focus();
          }
        }, 500);
      }
    });
  });
}

/**
 * Initialize typing animations for testimonials
 */
function initTestimonialTyping() {
  const testimonialTexts = document.querySelectorAll('.testimonial-text[data-text]');
  if (testimonialTexts.length === 0) {
    return;
  }

  // Create Intersection Observer for testimonials
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px',
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
        const textElement = entry.target;
        const fullText = textElement.getAttribute('data-text');

        // Mark as observed to prevent re-triggering
        textElement.classList.add('typed');

        // Start typing animation
        typeText(textElement, fullText);

        // Unobserve after animation starts
        observer.unobserve(textElement);
      }
    });
  }, observerOptions);

  // Observe all testimonial texts
  testimonialTexts.forEach(text => {
    // Clear text and prepare for typing animation
    const fullText = text.getAttribute('data-text');
    text.textContent = '';
    text.classList.add('typing');
    observer.observe(text);
  });
}

/**
 * Type text character by character
 */
function typeText(element, text) {
  let index = 0;
  const speed = 30; // milliseconds per character

  function type() {
    if (index < text.length) {
      element.textContent = text.substring(0, index + 1);
      index++;
      setTimeout(type, speed);
    } else {
      // Animation complete
      element.classList.remove('typing');
    }
  }

  type();
}

/**
 * Enable click-to-activate map interaction to suppress Google Maps overlay
 */
function initMapInteractionToggle() {
  const mapContainers = document.querySelectorAll('[data-map-interaction]');
  if (mapContainers.length === 0) {
    return;
  }

  mapContainers.forEach(container => {
    const toggleButton = container.querySelector('[data-map-toggle]');

    if (!toggleButton) {
      return;
    }

    const defaultLabel = toggleButton.textContent.trim() || 'Enable map controls';
    const activeLabel = toggleButton.getAttribute('data-active-label') || 'Disable map controls';

    const nudgeMapForOverlay = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const navOffset = 90;
      const desiredTop = window.scrollY + rect.top - navOffset;
      const isCentered =
        rect.top >= navOffset && rect.bottom <= viewportHeight - navOffset;

      if (!isCentered) {
        window.scrollTo({
          top: Math.max(desiredTop, 0),
          behavior: 'smooth',
        });

        setTimeout(() => {
          window.scrollBy({
            top: -24,
            behavior: 'smooth',
          });
        }, 450);
      } else {
        window.scrollBy({
          top: 2,
          behavior: 'smooth',
        });

        setTimeout(() => {
          window.scrollBy({
            top: -2,
            behavior: 'smooth',
          });
        }, 220);
      }
    };

    const enableMap = ({ focusToggle = false } = {}) => {
      if (container.classList.contains('is-active')) {
        return;
      }

      container.classList.add('is-active');
      toggleButton.classList.add('is-active');
      toggleButton.setAttribute('aria-pressed', 'true');
      toggleButton.textContent = activeLabel;

      if (focusToggle) {
        requestAnimationFrame(() => toggleButton.focus());
      }

      setTimeout(nudgeMapForOverlay, 180);
    };

    const disableMap = ({ focusToggle = false } = {}) => {
      if (!container.classList.contains('is-active')) {
        return;
      }

      container.classList.remove('is-active');
      toggleButton.classList.remove('is-active');
      toggleButton.setAttribute('aria-pressed', 'false');
      toggleButton.textContent = defaultLabel;

      if (focusToggle) {
        requestAnimationFrame(() => toggleButton.focus());
      }
    };

    toggleButton.addEventListener('click', event => {
      event.preventDefault();

      if (container.classList.contains('is-active')) {
        disableMap();
      } else {
        enableMap();
      }
    });

    toggleButton.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (container.classList.contains('is-active')) {
            disableMap();
          } else {
            enableMap();
          }
        }
      },
      { passive: false }
    );

    container.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          disableMap({ focusToggle: true });
        }
      },
      { passive: true }
    );
  });
}
