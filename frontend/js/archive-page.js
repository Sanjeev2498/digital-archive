/**
 * Archive Page Script
 * Handles archive content display, search, and filtering
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const authenticated = await AuthService.requireAuth();
  if (!authenticated) return;

  // Get DOM elements
  const archiveGrid = document.getElementById('archive-grid');
  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.btn-filter');
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const userNameSpan = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');

  // State
  let allContent = [];
  let filteredContent = [];
  let currentCategory = 'all';
  let currentSearchQuery = '';

  // Display user name
  const user = AuthService.getCurrentUser();
  if (user && userNameSpan) {
    userNameSpan.textContent = user.name;
  }

  // Load and display content
  async function loadContent() {
    try {
      UIService.showLoading();
      loadingState.classList.remove('hidden');
      archiveGrid.classList.add('hidden');
      emptyState.classList.add('hidden');

      allContent = await ArchiveService.loadContent();
      filteredContent = allContent;

      displayContent();
      
      loadingState.classList.add('hidden');
      UIService.hideLoading();
    } catch (error) {
      console.error('Error loading content:', error);
      loadingState.classList.add('hidden');
      UIService.hideLoading();
      
      // Display user-friendly error message
      if (error.message && error.message.includes('Network error')) {
        UIService.showError('Network error. Please check your connection and try again.');
      } else {
        UIService.showError('Failed to load archive content. Please try again.');
      }
    }
  }

  // Display content
  function displayContent() {
    if (filteredContent.length === 0) {
      archiveGrid.classList.add('hidden');
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      archiveGrid.classList.remove('hidden');
      
      // Render content with search highlighting
      if (currentSearchQuery) {
        archiveGrid.innerHTML = renderContentWithHighlight(filteredContent, currentSearchQuery);
      } else {
        archiveGrid.innerHTML = UIService.renderArchiveItems(filteredContent);
      }
    }
  }

  // Render content with search term highlighting
  function renderContentWithHighlight(items, query) {
    return items.map(item => `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${UIService.highlightText(item.title, query)}</h3>
          <span class="badge" style="background-color: var(--secondary); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">
            ${UIService.escapeHtml(item.category)}
          </span>
        </div>
        <div class="card-body">
          <p>${UIService.highlightText(item.description, query)}</p>
          ${item.tags && item.tags.length > 0 ? `
            <div class="mt-md">
              ${item.tags.map(tag => `
                <span style="background-color: var(--surface-dark); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.25rem;">
                  ${UIService.escapeHtml(tag)}
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
  }

  // Apply filters
  function applyFilters() {
    let result = allContent;

    // Apply category filter
    if (currentCategory !== 'all') {
      result = ArchiveService.filterByCategory(result, currentCategory);
    }

    // Apply search filter
    if (currentSearchQuery) {
      result = ArchiveService.searchContent(result, currentSearchQuery);
    }

    filteredContent = result;
    displayContent();
  }

  // Handle search input with debouncing
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearchQuery = e.target.value.trim();
      applyFilters();
    }, 300); // 300ms debounce
  });

  // Handle category filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state and aria-pressed
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      // Update current category
      currentCategory = button.dataset.category;
      applyFilters();
    });
  });

  // Handle clear filters
  clearFiltersBtn.addEventListener('click', () => {
    // Reset filters
    currentCategory = 'all';
    currentSearchQuery = '';
    searchInput.value = '';

    // Reset active button and aria-pressed
    filterButtons.forEach(btn => {
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    applyFilters();
  });

  // Handle logout
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
      UIService.showLoading();
      await AuthService.logout();
      UIService.hideLoading();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      UIService.hideLoading();
      
      // Display error but still redirect to login
      if (error.message && error.message.includes('Network error')) {
        UIService.showError('Network error during logout. Redirecting to login...');
      }
      
      // Redirect to login after brief delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  });

  // Initial load
  await loadContent();
});
