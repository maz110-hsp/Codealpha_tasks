const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for post images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'post-' + unique + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(null, ext && mime);
    }
});

// Create post
router.post('/api/posts', requireLogin, upload.single('image'), (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Post content is required' });
        }

        const image = req.file ? '/uploads/' + req.file.filename : null;
        const result = db.prepare('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)').run(
            req.session.userId, content.trim(), image
        );

        const post = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        0 as like_count, 0 as comment_count, 0 as liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

        res.json(post);
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single post
router.get('/api/posts/:id', (req, res) => {
    try {
        const userId = req.session?.userId || 0;
        const post = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(userId, req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error('Get post error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete post
router.delete('/api/posts/:id', requireLogin, (req, res) => {
    try {
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.user_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });

        db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Like/unlike post
router.post('/api/posts/:id/like', requireLogin, (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;

        const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
        if (existing) {
            db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
        } else {
            db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
        }

        const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);
        res.json({ liked: !existing, like_count: count.count });
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
