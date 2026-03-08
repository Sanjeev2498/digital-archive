/**
 * Admin Page Script
 * Handles admin dashboard functionality and content management
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check admin authentication
  const isAdmin = await AuthService.requireAdmin();
  if (!isAdmin) return;

  // Get DOM elements
  const contentTableBody = document.getElementById('content-table-body');
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const addNewBtn = document.getElementById('add-new-btn');
  const userNameSpan = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');

  // Modal elements
  const contentModal = document.getElementById('content-modal');
  const modalTitle = document.getElementById('modal-title');
  const contentForm = document.getElementById('content-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  // Delete modal elements
  const deleteModal = document.getElementById('delete-modal');
  const deleteModalCloseBtn = document.getElementById('delete-modal-close-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

  // State
  let allContent = [];
  let currentEditId = null;
  let currentDeleteId = null;

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
      contentTableBody.innerHTML = '';
      emptyState.classList.add('hidden');

      allContent = await ArchiveService.loadContent();

      if (allContent.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        contentTableBody.innerHTML = UIService.renderAdminTable(allContent);
        attachRowEventListeners();
      }

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
        UIService.showError('Failed to load content. Please try again.');
      }
    }
  }

  // Attach event listeners to table rows
  function attachRowEventListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        openEditModal(id);
      });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        openDeleteModal(id);
      });
    });
  }

  // Open add modal
  function openAddModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add New Content';
    contentForm.reset();
    document.getElementById('content-id').value = '';
    contentModal.classList.add('active');
    
    // Set focus to first input for accessibility
    setTimeout(() => {
      document.getElementById('content-title').focus();
    }, 100);
  }

  // Open edit modal
  async function openEditModal(id) {
    currentEditId = id;
    modalTitle.textContent = 'Edit Content';
    
    try {
      UIService.showLoading();
      const item = await ArchiveService.getContentById(id);
      UIService.hideLoading();
      
      if (item) {
        document.getElementById('content-id').value = item.id;
        document.getElementById('content-title').value = item.title;
        document.getElementById('content-category').value = item.category;
        document.getElementById('content-description').value = item.description;
        document.getElementById('content-body').value = item.content;
        document.getElementById('content-tags').value = item.tags ? item.tags.join(', ') : '';
        
        contentModal.classList.add('active');
        
        // Set focus to first input for accessibility
        setTimeout(() => {
          document.getElementById('content-title').focus();
        }, 100);
      } else {
        UIService.showError('Content not found.');
      }
    } catch (error) {
      UIService.hideLoading();
      
      // Display user-friendly error message
      if (error.message && error.message.includes('Network error')) {
        UIService.showError('Network error. Please check your connection and try again.');
      } else {
        UIService.showError('Failed to load content for editing. Please try again.');
      }
    }
  }

  // Close content modal
  function closeContentModal() {
    contentModal.classList.remove('active');
    contentForm.reset();
    currentEditId = null;
  }

  // Open delete modal
  function openDeleteModal(id) {
    currentDeleteId = id;
    deleteModal.classList.add('active');
    
    // Set focus to cancel button for safety (prevents accidental deletion)
    setTimeout(() => {
      cancelDeleteBtn.focus();
    }, 100);
  }

  // Close delete modal
  function closeDeleteModal() {
    deleteModal.classList.remove('active');
    currentDeleteId = null;
  }

  // Handle form submission
  contentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const title = document.getElementById('content-title').value.trim();
    const category = document.getElementById('content-category').value;
    const description = document.getElementById('content-description').value.trim();
    const content = document.getElementById('content-body').value.trim();
    const tagsInput = document.getElementById('content-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Validate
    if (!title || !category || !description || !content) {
      UIService.showError('Please fill in all required fields');
      return;
    }

    try {
      UIService.showLoading();

      if (currentEditId) {
        // Update existing content
        await ArchiveService.updateContent(currentEditId, {
          title,
          category,
          description,
          content,
          tags
        });
        UIService.showSuccess('Content updated successfully');
      } else {
        // Add new content
        await ArchiveService.addContent({
          title,
          category,
          description,
          content,
          tags,
          author: user.name
        });
        UIService.showSuccess('Content added successfully');
      }

      UIService.hideLoading();
      closeContentModal();
      await loadContent();
    } catch (error) {
      UIService.hideLoading();
      
      // Display user-friendly error message
      if (error.message && error.message.includes('Network error')) {
        UIService.showError('Network error. Please check your connection and try again.');
      } else {
        UIService.showError(error.message || 'Failed to save content. Please try again.');
      }
    }
  });

  // Handle delete confirmation
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!currentDeleteId) return;

    try {
      UIService.showLoading();
      await ArchiveService.deleteContent(currentDeleteId);
      UIService.hideLoading();
      UIService.showSuccess('Content deleted successfully');
      closeDeleteModal();
      await loadContent();
    } catch (error) {
      UIService.hideLoading();
      
      // Display user-friendly error message
      if (error.message && error.message.includes('Network error')) {
        UIService.showError('Network error. Please check your connection and try again.');
      } else {
        UIService.showError(error.message || 'Failed to delete content. Please try again.');
      }
    }
  });

  // Event listeners
  addNewBtn.addEventListener('click', openAddModal);
  modalCloseBtn.addEventListener('click', closeContentModal);
  modalCancelBtn.addEventListener('click', closeContentModal);
  deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Close modals on outside click
  contentModal.addEventListener('click', (e) => {
    if (e.target === contentModal) {
      closeContentModal();
    }
  });

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Keyboard navigation - Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (contentModal.classList.contains('active')) {
        closeContentModal();
      }
      if (deleteModal.classList.contains('active')) {
        closeDeleteModal();
      }
    }
  });

  // Trap focus within modal when open
  function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  // Apply focus trap to modals
  trapFocus(contentModal);
  trapFocus(deleteModal);

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
