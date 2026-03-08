/**
 * UI Helper Module
 * Handles UI updates, loading states, and user feedback
 */

const UIService = {
  /**
   * Show loading overlay
   */
  showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  },

  /**
   * Hide loading overlay
   */
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  },

  /**
   * Show error message
   * @param {string} message - Error message to display
   * @param {string} elementId - ID of error message container (default: 'error-message')
   */
  showError(message, elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideError(elementId);
      }, 5000);
    }
  },

  /**
   * Hide error message
   * @param {string} elementId - ID of error message container
   */
  hideError(elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  },

  /**
   * Show success message
   * @param {string} message - Success message to display
   * @param {string} elementId - ID of success message container (default: 'success-message')
   */
  showSuccess(message, elementId = 'success-message') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
      successElement.textContent = message;
      successElement.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideSuccess(elementId);
      }, 5000);
    }
  },

  /**
   * Hide success message
   * @param {string} elementId - ID of success message container
   */
  hideSuccess(elementId = 'success-message') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
      successElement.classList.add('hidden');
    }
  },

  /**
   * Render archive items as cards
   * @param {Array} items - Array of archive content items
   * @returns {string} HTML string of rendered cards
   */
  renderArchiveItems(items) {
    if (!items || items.length === 0) {
      return '';
    }

    return items.map(item => `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${this.escapeHtml(item.title)}</h3>
          <span class="badge" style="background-color: var(--secondary); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">
            ${this.escapeHtml(item.category)}
          </span>
        </div>
        <div class="card-body">
          <p>${this.escapeHtml(item.description)}</p>
          ${item.tags && item.tags.length > 0 ? `
            <div class="mt-md">
              ${item.tags.map(tag => `
                <span style="background-color: var(--surface-dark); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.25rem;">
                  ${this.escapeHtml(tag)}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="card-footer">
          <small style="color: var(--text-secondary);">
            Added: ${new Date(item.dateAdded).toLocaleDateString()}
          </small>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render admin table rows
   * @param {Array} items - Array of archive content items
   * @returns {string} HTML string of table rows
   */
  renderAdminTable(items) {
    if (!items || items.length === 0) {
      return '';
    }

    return items.map(item => `
      <tr>
        <td>${this.escapeHtml(item.title)}</td>
        <td>
          <span class="badge" style="background-color: var(--secondary); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">
            ${this.escapeHtml(item.category)}
          </span>
        </td>
        <td>${new Date(item.dateAdded).toLocaleDateString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-secondary btn-edit" data-id="${item.id}" aria-label="Edit ${this.escapeHtml(item.title)}">
              Edit
            </button>
            <button class="btn btn-error btn-delete" data-id="${item.id}" aria-label="Delete ${this.escapeHtml(item.title)}">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Highlight search terms in text
   * @param {string} text - Text to highlight in
   * @param {string} query - Search query to highlight
   * @returns {string} Text with highlighted terms
   */
  highlightText(text, query) {
    if (!query || !text) return this.escapeHtml(text);
    
    const escapedText = this.escapeHtml(text);
    const regex = new RegExp(`(${query})`, 'gi');
    return escapedText.replace(regex, '<mark style="background-color: var(--accent); padding: 0.125rem;">$1</mark>');
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.UIService = UIService;
}
