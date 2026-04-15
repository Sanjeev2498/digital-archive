const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../db');

// Middleware: require login
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
}

// Middleware: require admin
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

// GET /api/content - public, get all content (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM archive_content';
    const params = [];
    const conditions = [];

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR content LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    // parse tags back to array
    const items = rows.map(r => ({ ...r, tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }));
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
});

// GET /api/content/stats/summary - get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [[totalCount]] = await query('SELECT COUNT(*) as total FROM archive_content');
    const categoryStats = await query('SELECT category, COUNT(*) as count FROM archive_content GROUP BY category ORDER BY count DESC');
    const mostViewed = await query('SELECT id, title, category, view_count FROM archive_content ORDER BY view_count DESC LIMIT 5');
    
    res.json({
      success: true,
      data: {
        total: totalCount.total,
        byCategory: categoryStats,
        mostViewed: mostViewed
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/content/:id - get single item
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM archive_content WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Increment view count
    await query('UPDATE archive_content SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
    
    row.tags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch item' });
  }
});

// POST /api/content - admin only, create content
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, category, description, content, tags, image_url } = req.body;
    if (!title || !category || !description || !content) {
      return res.status(400).json({ success: false, message: 'title, category, description and content are required' });
    }
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');
    const user = req.session.user;
    const result = await query(
      'INSERT INTO archive_content (title, category, description, content, tags, image_url, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, description, content, tagsStr, image_url || null, user.id, user.name]
    );
    res.status(201).json({ success: true, message: 'Content created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create content' });
  }
});

// PUT /api/content/:id - admin only, update content
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, category, description, content, tags, image_url } = req.body;
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');
    await query(
      'UPDATE archive_content SET title=?, category=?, description=?, content=?, tags=?, image_url=? WHERE id=?',
      [title, category, description, content, tagsStr, image_url || null, req.params.id]
    );
    res.json({ success: true, message: 'Content updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
});

// DELETE /api/content/:id - admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM archive_content WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

module.exports = router;
