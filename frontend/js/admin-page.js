document.addEventListener('DOMContentLoaded', async () => {
  const isAdmin = await AuthService.requireAdmin();
  if (!isAdmin) return;

  const tableBody = document.getElementById('content-table-body');
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const addNewBtn = document.getElementById('add-new-btn');
  const userNameSpan = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');

  const contentModal = document.getElementById('content-modal');
  const modalTitle = document.getElementById('modal-title');
  const contentForm = document.getElementById('content-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  const deleteModal = document.getElementById('delete-modal');
  const deleteModalCloseBtn = document.getElementById('delete-modal-close-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

  let currentEditId = null;
  let currentDeleteId = null;

  const user = AuthService.getCurrentUser();
  if (user && userNameSpan) userNameSpan.textContent = user.name;

  // Update navigation
  const mainNav = document.getElementById('main-nav');
  if (user && mainNav) {
    const navItems = [];
    navItems.push('<li><a href="/">Home</a></li>');
    navItems.push('<li><a href="/archive">Archive</a></li>');
    navItems.push('<li><a href="/admin" aria-current="page">Admin</a></li>');
    navItems.push(`<li><span id="user-name" style="color: var(--accent);">${user.name}</span></li>`);
    navItems.push('<li><a href="#" id="logout-btn">Logout</a></li>');
    mainNav.innerHTML = navItems.join('');
    
    // Re-attach logout listener
    const newLogoutBtn = document.getElementById('logout-btn');
    if (newLogoutBtn) {
      newLogoutBtn.addEventListener('click', async e => {
        e.preventDefault();
        await AuthService.logout();
        window.location.href = '/login';
      });
    }
  }

  async function loadContent() {
    loadingState.classList.remove('hidden');
    tableBody.innerHTML = '';
    emptyState.classList.add('hidden');
    try {
      const items = await ArchiveService.loadContent();
      loadingState.classList.add('hidden');
      if (items.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        tableBody.innerHTML = renderRows(items);
        attachRowListeners();
      }
    } catch (err) {
      loadingState.classList.add('hidden');
      UIService.showError('Failed to load content.');
    }
  }

  function renderRows(items) {
    return items.map(item => `
      <tr>
        <td>${UIService.escapeHtml(item.title)}</td>
        <td><span style="background:var(--secondary);color:white;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.875rem;">${UIService.escapeHtml(item.category)}</span></td>
        <td>${new Date(item.created_at).toLocaleDateString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-secondary btn-edit" data-id="${item.id}" aria-label="Edit ${UIService.escapeHtml(item.title)}">Edit</button>
            <button class="btn btn-error btn-delete" data-id="${item.id}" aria-label="Delete ${UIService.escapeHtml(item.title)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function attachRowListeners() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
  }

  function openAddModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add New Content';
    contentForm.reset();
    document.getElementById('content-id').value = '';
    contentModal.classList.add('active');
    document.getElementById('content-title').focus();
  }

  async function openEditModal(id) {
    try {
      const item = await ArchiveService.getOne(id);
      currentEditId = id;
      modalTitle.textContent = 'Edit Content';
      document.getElementById('content-id').value = item.id;
      document.getElementById('content-title').value = item.title;
      document.getElementById('content-category').value = item.category;
      document.getElementById('content-description').value = item.description;
      document.getElementById('content-body').value = item.content;
      document.getElementById('content-tags').value = Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '');
      document.getElementById('content-image').value = item.image_url || '';
      contentModal.classList.add('active');
      document.getElementById('content-title').focus();
    } catch (err) {
      UIService.showError('Failed to load item for editing.');
    }
  }

  function openDeleteModal(id) {
    currentDeleteId = id;
    deleteModal.classList.add('active');
    confirmDeleteBtn.focus();
  }

  function closeModals() {
    contentModal.classList.remove('active');
    deleteModal.classList.remove('active');
    currentEditId = null;
    currentDeleteId = null;
  }

  contentForm.addEventListener('submit', async e => {
    e.preventDefault();
    const tagsRaw = document.getElementById('content-tags').value;
    const payload = {
      title: document.getElementById('content-title').value.trim(),
      category: document.getElementById('content-category').value,
      description: document.getElementById('content-description').value.trim(),
      content: document.getElementById('content-body').value.trim(),
      tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      image_url: document.getElementById('content-image').value.trim() || null
    };
    try {
      if (currentEditId) {
        await ArchiveService.update(currentEditId, payload);
        UIService.showSuccess('Content updated successfully.');
      } else {
        await ArchiveService.create(payload);
        UIService.showSuccess('Content added successfully.');
      }
      closeModals();
      await loadContent();
    } catch (err) {
      UIService.showError(err.message || 'Failed to save content.');
    }
  });

  confirmDeleteBtn.addEventListener('click', async () => {
    try {
      await ArchiveService.remove(currentDeleteId);
      UIService.showSuccess('Content deleted.');
      closeModals();
      await loadContent();
    } catch (err) {
      UIService.showError('Failed to delete content.');
    }
  });

  addNewBtn.addEventListener('click', openAddModal);
  modalCloseBtn.addEventListener('click', closeModals);
  modalCancelBtn.addEventListener('click', closeModals);
  deleteModalCloseBtn.addEventListener('click', closeModals);
  cancelDeleteBtn.addEventListener('click', closeModals);

  await loadContent();
});
