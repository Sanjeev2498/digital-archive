/**
 * Archive Service Module
 * Manages indigenous knowledge content storage and retrieval
 */

const ArchiveService = {
  STORAGE_KEY: 'archiveContent',
  DEFAULT_DATA_URL: '/data/default-archive.json',

  /**
   * Load content from localStorage or default JSON
   * @returns {Promise<Array>} Array of content items
   */
  async loadContent() {
    try {
      // Try to load from localStorage first
      const storedContent = localStorage.getItem(this.STORAGE_KEY);
      
      if (storedContent) {
        return JSON.parse(storedContent);
      }

      // If no stored content, load default data
      const response = await fetch(this.DEFAULT_DATA_URL);
      if (response.ok) {
        const defaultData = await response.json();
        // Save to localStorage for future use
        this.saveContent(defaultData);
        return defaultData;
      }

      // If default data fails, return empty array
      return [];
    } catch (error) {
      console.error('Error loading content:', error);
      return [];
    }
  },

  /**
   * Save content to localStorage
   * @param {Array} content - Array of content items
   */
  saveContent(content) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(content));
    } catch (error) {
      console.error('Error saving content:', error);
      throw new Error('Failed to save content');
    }
  },

  /**
   * Search content by query (searches title and description)
   * @param {Array} content - Array of content items
   * @param {string} query - Search query
   * @returns {Array} Filtered content items
   */
  searchContent(content, query) {
    if (!query || query.trim() === '') {
      return content;
    }

    const lowerQuery = query.toLowerCase().trim();
    
    return content.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const descriptionMatch = item.description.toLowerCase().includes(lowerQuery);
      const contentMatch = item.content && item.content.toLowerCase().includes(lowerQuery);
      
      return titleMatch || descriptionMatch || contentMatch;
    });
  },

  /**
   * Filter content by category
   * @param {Array} content - Array of content items
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered content items
   */
  filterByCategory(content, category) {
    if (!category || category === 'all') {
      return content;
    }

    return content.filter(item => item.category === category);
  },

  /**
   * Add new content item
   * @param {Object} item - Content item to add
   * @returns {Object} Added item with generated ID
   */
  async addContent(item) {
    try {
      const content = await this.loadContent();
      
      // Generate unique ID
      const newItem = {
        id: this.generateId(),
        title: item.title,
        category: item.category,
        description: item.description,
        content: item.content,
        tags: item.tags || [],
        dateAdded: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: item.author || 'Admin'
      };

      content.push(newItem);
      this.saveContent(content);
      
      return newItem;
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  },

  /**
   * Update existing content item
   * @param {string} id - Content item ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated item
   */
  async updateContent(id, updates) {
    try {
      const content = await this.loadContent();
      const index = content.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error('Content not found');
      }

      // Update item
      content[index] = {
        ...content[index],
        ...updates,
        id: content[index].id, // Preserve ID
        dateAdded: content[index].dateAdded, // Preserve original date
        lastModified: new Date().toISOString()
      };

      this.saveContent(content);
      
      return content[index];
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  /**
   * Delete content item
   * @param {string} id - Content item ID
   */
  async deleteContent(id) {
    try {
      const content = await this.loadContent();
      const filtered = content.filter(item => item.id !== id);
      
      if (filtered.length === content.length) {
        throw new Error('Content not found');
      }

      this.saveContent(filtered);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  /**
   * Get content item by ID
   * @param {string} id - Content item ID
   * @returns {Promise<Object|null>} Content item or null
   */
  async getContentById(id) {
    try {
      const content = await this.loadContent();
      return content.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error getting content by ID:', error);
      return null;
    }
  },

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.ArchiveService = ArchiveService;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArchiveService;
}
