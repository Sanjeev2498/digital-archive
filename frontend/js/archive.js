/**
 * Archive Service - fetches content from backend API
 */
const ArchiveService = {
  API_URL: '/api/content',

  async loadContent(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const url = this.API_URL + (params.toString() ? '?' + params.toString() : '');
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch content');
    const data = await res.json();
    return data.data || [];
  },

  async getOne(id) {
    const res = await fetch(`${this.API_URL}/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    return data.data;
  },

  async create(item) {
    const token = await AuthService.getCsrfToken();
    const res = await fetch(this.API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create');
    return data;
  },

  async update(id, item) {
    const token = await AuthService.getCsrfToken();
    const res = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update');
    return data;
  },

  async remove(id) {
    const token = await AuthService.getCsrfToken();
    const res = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-Token': token }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete');
    return data;
  }
};

if (typeof window !== 'undefined') window.ArchiveService = ArchiveService;
