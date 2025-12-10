/**
 * Unit Tests for js/pages/contact.js
 * Tests contact form validation, submission, and localStorage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initContactForm } from '../../../js/pages/contact.js';
import * as toast from '../../../js/utils/toast.js';
import * as env from '../../../js/utils/env.js';

// Mock dependencies
vi.mock('../../../js/utils/toast.js');
vi.mock('../../../js/utils/env.js');

describe('contact.js', () => {
  let contactForm;
  let nameInput;
  let emailInput;
  let subjectInput;
  let messageTextarea;
  let submitButton;

  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();

    // Create form structure
    contactForm = document.createElement('form');
    contactForm.id = 'contactForm';

    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameInput = document.createElement('input');
    nameInput.id = 'name';
    nameInput.type = 'text';
    nameInput.required = true;
    nameGroup.appendChild(nameInput);
    const nameError = document.createElement('span');
    nameError.id = 'name-error';
    nameError.className = 'error-message';
    nameGroup.appendChild(nameError);
    contactForm.appendChild(nameGroup);

    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';
    emailInput = document.createElement('input');
    emailInput.id = 'email';
    emailInput.type = 'email';
    emailInput.required = true;
    emailGroup.appendChild(emailInput);
    const emailError = document.createElement('span');
    emailError.id = 'email-error';
    emailError.className = 'error-message';
    emailGroup.appendChild(emailError);
    contactForm.appendChild(emailGroup);

    const subjectGroup = document.createElement('div');
    subjectGroup.className = 'form-group';
    subjectInput = document.createElement('input');
    subjectInput.id = 'subject';
    subjectInput.type = 'text';
    subjectInput.required = true;
    subjectGroup.appendChild(subjectInput);
    const subjectError = document.createElement('span');
    subjectError.id = 'subject-error';
    subjectError.className = 'error-message';
    subjectGroup.appendChild(subjectError);
    contactForm.appendChild(subjectGroup);

    const messageGroup = document.createElement('div');
    messageGroup.className = 'form-group';
    messageTextarea = document.createElement('textarea');
    messageTextarea.id = 'message';
    messageTextarea.required = true;
    messageGroup.appendChild(messageTextarea);
    const messageError = document.createElement('span');
    messageError.id = 'message-error';
    messageError.className = 'error-message';
    messageGroup.appendChild(messageError);
    contactForm.appendChild(messageGroup);

    submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.type = 'submit';
    contactForm.appendChild(submitButton);

    document.body.appendChild(contactForm);

    // Mock fetch
    global.fetch = vi.fn();

    // Mock environment
    vi.spyOn(env, 'isDevelopmentEnv').mockReturnValue(false);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('initContactForm', () => {
    it('should initialize form without errors', () => {
      expect(() => initContactForm()).not.toThrow();
    });

    it('should return early if form is missing', () => {
      document.body.innerHTML = '';
      expect(() => initContactForm()).not.toThrow();
    });

    it('should load saved form data from localStorage', () => {
      localStorage.setItem(
        'logi-ink-contact-form',
        JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
        })
      );

      initContactForm();

      expect(nameInput.value).toBe('Test User');
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should save form data to localStorage on input', () => {
      initContactForm();

      nameInput.value = 'John Doe';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));

      const saved = JSON.parse(localStorage.getItem('logi-ink-contact-form'));
      expect(saved.name).toBe('John Doe');
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      initContactForm();
    });

    it('should validate required fields', () => {
      nameInput.value = '';
      nameInput.dispatchEvent(new Event('blur', { bubbles: true }));

      expect(nameInput.closest('.form-group').classList.contains('error')).toBe(true);
    });

    it('should validate email format', () => {
      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));

      expect(emailInput.closest('.form-group').classList.contains('error')).toBe(true);
    });

    it('should accept valid email', () => {
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));

      expect(emailInput.closest('.form-group').classList.contains('error')).toBe(false);
    });

    it('should validate message length', () => {
      messageTextarea.value = 'a'.repeat(1001); // Exceeds MAX_MESSAGE_LENGTH
      messageTextarea.dispatchEvent(new Event('blur', { bubbles: true }));

      expect(messageTextarea.closest('.form-group').classList.contains('error')).toBe(true);
    });

    it('should clear errors on input', () => {
      nameInput.value = '';
      nameInput.dispatchEvent(new Event('blur', { bubbles: true }));

      expect(nameInput.closest('.form-group').classList.contains('error')).toBe(true);

      nameInput.value = 'Valid Name';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));

      expect(nameInput.closest('.form-group').classList.contains('error')).toBe(false);
    });
  });

  describe('form submission', () => {
    beforeEach(() => {
      initContactForm();
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
    });

    it('should prevent default form submission', () => {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      contactForm.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should submit valid form data', async () => {
      nameInput.value = 'Test User';
      emailInput.value = 'test@example.com';
      subjectInput.value = 'Test Subject';
      messageTextarea.value = 'Test message';

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      contactForm.dispatchEvent(submitEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        'https://formspree.io/f/mkgdbljg',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        })
      );
    });

    it('should show success toast on successful submission', async () => {
      nameInput.value = 'Test User';
      emailInput.value = 'test@example.com';
      subjectInput.value = 'Test Subject';
      messageTextarea.value = 'Test message';

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      contactForm.dispatchEvent(submitEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(toast.showToast).toHaveBeenCalledWith(
        expect.stringContaining('Thank you'),
        'success'
      );
    });

    it('should show error toast on failed submission', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Submission failed' }),
      });

      nameInput.value = 'Test User';
      emailInput.value = 'test@example.com';
      subjectInput.value = 'Test Subject';
      messageTextarea.value = 'Test message';

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      contactForm.dispatchEvent(submitEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(toast.showToast).toHaveBeenCalledWith(
        expect.any(String),
        'error'
      );
    });

    it('should clear form after successful submission', async () => {
      nameInput.value = 'Test User';
      emailInput.value = 'test@example.com';
      subjectInput.value = 'Test Subject';
      messageTextarea.value = 'Test message';

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      contactForm.dispatchEvent(submitEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(nameInput.value).toBe('');
      expect(localStorage.getItem('logi-ink-contact-form')).toBeNull();
    });
  });
});

