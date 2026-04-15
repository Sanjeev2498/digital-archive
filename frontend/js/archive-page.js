document.addEventListener('DOMContentLoaded', async () => {
  const archiveGrid = document.getElementById('archive-grid');
  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.btn-filter');
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const userNameSpan = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');
  const statsPanel = document.getElementById('stats-panel');

  let currentCategory = 'all';
  let currentSearch = '';
  let allItems = [];

  const user = AuthService.getCurrentUser();
  if (user && userNameSpan) userNameSpan.textContent = user.name;

  // Update navigation based on user role
  const mainNav = document.getElementById('main-nav');
  if (user && mainNav) {
    const navItems = [];
    navItems.push('<li><a href="/">Home</a></li>');
    navItems.push('<li><a href="/archive" aria-current="page">Archive</a></li>');
    if (user.role === 'admin') {
      navItems.push('<li><a href="/admin">Admin</a></li>');
    }
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

  // Load stats
  async function loadStats() {
    try {
      const res = await fetch('/api/content/stats/summary', { credentials: 'include' });
      if (res.ok) {
        const { data } = await res.json();
        document.getElementById('stat-total').textContent = data.total;
        document.getElementById('stat-categories').textContent = data.byCategory.length;
        const totalViews = data.mostViewed.reduce((sum, item) => sum + item.view_count, 0);
        document.getElementById('stat-views').textContent = totalViews;
        statsPanel.style.display = 'grid';
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function loadContent() {
    loadingState.classList.remove('hidden');
    archiveGrid.classList.add('hidden');
    emptyState.classList.add('hidden');
    try {
      allItems = await ArchiveService.loadContent(currentCategory, currentSearch);
      loadingState.classList.add('hidden');
      if (allItems.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        archiveGrid.innerHTML = renderCards(allItems);
        archiveGrid.classList.remove('hidden');
        attachCardListeners();
      }
    } catch (err) {
      loadingState.classList.add('hidden');
      UIService.showError('Failed to load content. Please try again.');
    }
  }

  function renderCards(items) {
    const categoryEmoji = { medicine: '🌿', agriculture: '🌾', cultural: '🎭', heritage: '📜', crafts: '🎨' };
    return items.map(item => `
      <div class="card archive-card" data-id="${item.id}" style="cursor:pointer;">
        ${item.image_url ? `
          <div style="width:100%;height:200px;overflow:hidden;border-radius:var(--radius-md) var(--radius-md) 0 0;margin:-var(--spacing-lg) -var(--spacing-lg) var(--spacing-md);">
            <img src="${UIService.escapeHtml(item.image_url)}" alt="${UIService.escapeHtml(item.title)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.display='none'">
          </div>
        ` : ''}
        <div class="card-header">
          <h3 class="card-title">${UIService.escapeHtml(item.title)}</h3>
          <span class="category-badge badge-${item.category}">
            ${categoryEmoji[item.category] || ''} ${UIService.escapeHtml(item.category)}
          </span>
        </div>
        <div class="card-body">
          <p>${UIService.escapeHtml(item.description)}</p>
          ${item.tags && item.tags.length ? `
            <div class="mt-md flex flex-wrap gap-sm">
              ${item.tags.map(t => `<span style="background:var(--surface-dark);color:var(--text-muted);padding:0.2rem 0.6rem;border-radius:var(--radius-full);font-size:0.75rem;border:1px solid var(--border-light);">#${UIService.escapeHtml(t)}</span>`).join('')}
            </div>` : ''}
        </div>
        <div class="card-footer">
          <small style="color:var(--text-muted);">
            By ${UIService.escapeHtml(item.author_name)} &bull; ${new Date(item.created_at).toLocaleDateString('en-IN', {year:'numeric',month:'short',day:'numeric'})}
            ${item.view_count > 0 ? ` &bull; ${item.view_count} views` : ''}
          </small>
        </div>
      </div>
    `).join('');
  }

  function attachCardListeners() {
    document.querySelectorAll('.archive-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const item = allItems.find(i => i.id == id);
        if (item) openModal(item);
      });
    });
  }

  function exportAsText(item) {
    const text = `${item.title}\n${'='.repeat(item.title.length)}\n\nCategory: ${item.category}\n\n${item.description}\n\n${item.content}\n\nTags: ${item.tags ? item.tags.join(', ') : 'None'}\n\nAuthor: ${item.author_name}\nDate: ${new Date(item.created_at).toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'})}\n\nSource: Indigenous Knowledge Archive\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openModal(item) {
    const categoryEmoji = { medicine: '🌿', agriculture: '🌾', cultural: '🎭', heritage: '📜', crafts: '🎨' };
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:800px;">
        ${item.image_url ? `
          <div style="width:calc(100% + var(--spacing-xl)*2);height:300px;overflow:hidden;margin:-var(--spacing-xl) -var(--spacing-xl) var(--spacing-lg);border-radius:var(--radius-xl) var(--radius-xl) 0 0;">
            <img src="${UIService.escapeHtml(item.image_url)}" alt="${UIService.escapeHtml(item.title)}" style="width:100%;height:100%;object-fit:cover;">
          </div>
        ` : ''}
        <div class="modal-header">
          <div>
            <span class="category-badge badge-${item.category}" style="margin-bottom:var(--spacing-sm);">
              ${categoryEmoji[item.category] || ''} ${UIService.escapeHtml(item.category)}
            </span>
            <h2 id="modal-title" style="margin:0;">${UIService.escapeHtml(item.title)}</h2>
          </div>
          <button class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div style="margin-bottom:var(--spacing-md);">
          <p style="font-size:1.1rem;color:var(--text-secondary);margin:0;">${UIService.escapeHtml(item.description)}</p>
        </div>
        <div style="margin-bottom:var(--spacing-lg);">
          <p style="line-height:1.8;color:var(--text-primary);">${UIService.escapeHtml(item.content)}</p>
        </div>
        ${item.tags && item.tags.length ? `
          <div class="flex flex-wrap gap-sm" style="margin-bottom:var(--spacing-lg);">
            ${item.tags.map(t => `<span style="background:var(--surface-dark);color:var(--text-muted);padding:0.3rem 0.8rem;border-radius:var(--radius-full);font-size:0.85rem;border:1px solid var(--border-light);">#${UIService.escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
        <div style="padding-top:var(--spacing-md);border-top:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--spacing-md);">
          <small style="color:var(--text-muted);">
            By ${UIService.escapeHtml(item.author_name)} &bull; ${new Date(item.created_at).toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'})}
            ${item.view_count > 0 ? ` &bull; ${item.view_count} views` : ''}
          </small>
          <div style="display:flex;gap:var(--spacing-sm);">
            <button class="btn btn-outline" id="export-text-btn" style="padding:0.4rem 1rem;font-size:0.85rem;">
              📄 Export as Text
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('#export-text-btn').addEventListener('click', () => {
      exportAsText(item);
      UIService.showSuccess('Content exported! You can now preserve this knowledge offline.');
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.remove();
    });
  }

  let searchTimeout;
  searchInput.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadContent();
    }, 300);
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentCategory = btn.dataset.category;
      loadContent();
    });
  });

  clearFiltersBtn.addEventListener('click', () => {
    currentCategory = 'all';
    currentSearch = '';
    searchInput.value = '';
    filterButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
      b.setAttribute('aria-pressed', b.dataset.category === 'all' ? 'true' : 'false');
    });
    loadContent();
  });

  await loadStats();
  await loadContent();
});
