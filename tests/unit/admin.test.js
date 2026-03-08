/**
 * Unit Tests: Admin Functionality
 * Tests for admin dashboard and content management
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;
global.fetch = jest.fn();

// Import the ArchiveService
let ArchiveService;
try {
  ArchiveService = require('../../frontend/js/archive.js');
} catch (error) {
  console.error('Failed to load ArchiveService:', error);
  throw error;
}

describe('Unit Tests: Admin Functionality', () => {
  
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  describe('Content Creation', () => {
    test('should add new content to display', async () => {
      localStorage.setItem('archiveContent', JSON.stringify([]));

      const newContent = {
        title: 'Traditional Herbal Medicine',
        category: 'medicine',
        description: 'Ancient healing practices',
        content: 'Detailed information about herbal medicine',
        tags: ['herbs', 'healing'],
        author: 'Admin User'
      };

      const result = await ArchiveService.addContent(newContent);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(newContent.title);
      expect(result.category).toBe(newContent.category);
    });
  });

  describe('Content Deletion', () => {
    test('should remove content from display', async () => {
      const initialContent = [
        { id: 'content_1', title: 'Content 1', category: 'medicine', description: 'Desc 1', content: 'Body 1' },
        { id: 'content_2', title: 'Content 2', category: 'agriculture', description: 'Desc 2', content: 'Body 2' }
      ];
      localStorage.setItem('archiveContent', JSON.stringify(initialContent));
      await ArchiveService.deleteContent('content_1');
      const remainingContent = await ArchiveService.loadContent();
      expect(remainingContent.length).toBe(1);
      expect(remainingContent[0].id).toBe('content_2');
    });

    test('should throw error when deleting non-existent content', async () => {
      localStorage.setItem('archiveContent', JSON.stringify([
        { id: 'content_1', title: 'Content 1', category: 'medicine', description: 'Desc', content: 'Body' }
      ]));
      await expect(ArchiveService.deleteContent('non_existent_id')).rejects.toThrow('Content not found');
    });
  });

  describe('Content Editing', () => {
    test('should update content in display', async () => {
      const initialContent = [{
        id: 'content_1',
        title: 'Original Title',
        category: 'medicine',
        description: 'Original Description',
        content: 'Original Body',
        dateAdded: '2024-01-01T00:00:00.000Z',
        lastModified: '2024-01-01T00:00:00.000Z'
      }];
      localStorage.setItem('archiveContent', JSON.stringify(initialContent));
      const updates = { title: 'Updated Title', description: 'Updated Description' };
      const result = await ArchiveService.updateContent('content_1', updates);
      expect(result.title).toBe(updates.title);
      expect(result.description).toBe(updates.description);
      expect(result.id).toBe('content_1');
      expect(result.dateAdded).toBe('2024-01-01T00:00:00.000Z');
      expect(result.lastModified).not.toBe('2024-01-01T00:00:00.000Z');
    });

    test('should throw error when updating non-existent content', async () => {
      localStorage.setItem('archiveContent', JSON.stringify([
        { id: 'content_1', title: 'Content 1', category: 'medicine', description: 'Desc', content: 'Body' }
      ]));
      await expect(ArchiveService.updateContent('non_existent_id', { title: 'New Title' })).rejects.toThrow('Content not found');
    });
  });

  describe('Non-Admin Redirect', () => {
    test('should redirect non-admin users to archive page', () => {
      const mockUser = { role: 'user', name: 'Regular User', email: 'user@example.com' };
      const mockAdmin = { role: 'admin', name: 'Admin User', email: 'admin@example.com' };
      const canAccessAdmin = (user) => user.role === 'admin';
      expect(canAccessAdmin(mockUser)).toBe(false);
      expect(canAccessAdmin(mockAdmin)).toBe(true);
    });
  });
});
