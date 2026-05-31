const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

// Get feed (posts from followed users + own posts)
router.get('/api/feed', requireLogin, (req, res) => {
    try {
        const userId = req.session.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const posts = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? OR p.user_id IN (
        SELECT following_id FROM followers WHERE follower_id = ?
      )
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, userId, userId, limit, offset);

        res.json(posts);
    } catch (err) {
        console.error('Feed error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get explore/discover (all recent posts)
router.get('/api/explore', (req, res) => {
    try {
        const userId = req.session?.userId || 0;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const posts = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

        res.json(posts);
    } catch (err) {
        console.error('Explore error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
