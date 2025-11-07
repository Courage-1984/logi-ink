/**
 * Toast Notification Utility
 * Creates and displays toast notifications for success/error messages
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export function showToast(message, type = 'success', duration = 5000) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  const icon =
    type === 'success'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 20px; height: 20px; margin-right: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 20px; height: 20px; margin-right: 0.5rem;"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>';

  toast.innerHTML = `
        <div class="toast-header">
            <div style="display: flex; align-items: center; color: ${type === 'success' ? 'var(--accent-green)' : 'var(--accent-pink)'};">
                ${icon}
                <strong>${type === 'success' ? 'Success' : 'Error'}</strong>
            </div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        </div>
        <div class="toast-body" style="color: var(--text-secondary);">${message}</div>
    `;

  // Add to body
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Close button handler
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    hideToast(toast);
  });

  // Auto-hide after duration
  if (duration > 0) {
    setTimeout(() => {
      hideToast(toast);
    }, duration);
  }

  return toast;
}

/**
 * Hide a toast notification
 * @param {HTMLElement} toast - The toast element to hide
 */
function hideToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}
