const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

// Get comments for a post
router.get('/api/posts/:postId/comments', (req, res) => {
    try {
        const comments = db.prepare(`
      SELECT c.*, u.username, u.display_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.postId);

        res.json(comments);
    } catch (err) {
        console.error('Get comments error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add comment
router.post('/api/posts/:postId/comments', requireLogin, (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const result = db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)').run(
            req.params.postId, req.session.userId, content.trim()
        );

        const comment = db.prepare(`
      SELECT c.*, u.username, u.display_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

        res.json(comment);
    } catch (err) {
        console.error('Add comment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete comment
router.delete('/api/comments/:id', requireLogin, (req, res) => {
    try {
        const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.user_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });

        db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
