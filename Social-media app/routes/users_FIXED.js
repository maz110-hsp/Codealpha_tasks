const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'avatar-' + unique + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(null, ext && mime);
    }
});

// Get user profile page
router.get('/profile/:username', (req, res) => {
    res.sendFile('profile.html', { root: './views' });
});

// Get user profile data
router.get('/api/users/:username', (req, res) => {
    try {
        const currentUserId = req.session?.userId || 0;
        const user = db.prepare(`
      SELECT id, username, display_name, bio, avatar, created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count,
        (SELECT COUNT(*) FROM followers WHERE following_id = users.id) as follower_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = users.id) as following_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = ? AND following_id = users.id) as is_following
      FROM users WHERE username = ?
    `).get(currentUserId, req.params.username);

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user posts
router.get('/api/users/:username/posts', (req, res) => {
    try {
        const currentUserId = req.session?.userId || 0;
        const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
        if (!user) return res.status(404).json({ error: 'User not found' });

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
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(currentUserId, user.id, limit, offset);

        res.json(posts);
    } catch (err) {
        console.error('Get user posts error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's followers
router.get('/api/users/:username/followers', (req, res) => {
    try {
        const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const followers = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar
      FROM users u
      JOIN followers f ON u.id = f.follower_id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `).all(user.id);

        res.json(followers);
    } catch (err) {
        console.error('Get followers error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's following
router.get('/api/users/:username/following', (req, res) => {
    try {
        const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const following = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar
      FROM users u
      JOIN followers f ON u.id = f.following_id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `).all(user.id);

        res.json(following);
    } catch (err) {
        console.error('Get following error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update profile
router.put('/api/users/profile', requireLogin, upload.single('avatar'), (req, res) => {
    try {
        const { display_name, bio } = req.body;
        const userId = req.session.userId;

        if (req.file) {
            db.prepare('UPDATE users SET display_name = ?, bio = ?, avatar = ? WHERE id = ?').run(
                display_name || '', bio || '', '/uploads/' + req.file.filename, userId
            );
        } else {
            db.prepare('UPDATE users SET display_name = ?, bio = ? WHERE id = ?').run(
                display_name || '', bio || '', userId
            );
        }

        const user = db.prepare('SELECT id, username, display_name, bio, avatar FROM users WHERE id = ?').get(userId);
        res.json(user);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete profile picture
router.delete('/api/users/profile/avatar', requireLogin, (req, res) => {
    try {
        const userId = req.session.userId;
        const defaultAvatar = '/uploads/default-avatar.png';
        
        db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(defaultAvatar, userId);
        
        const user = db.prepare('SELECT id, username, display_name, bio, avatar FROM users WHERE id = ?').get(userId);
        res.json(user);
    } catch (err) {
        console.error('Delete avatar error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Follow/unfollow user
router.post('/api/users/:username/follow', requireLogin, (req, res) => {
    try {
        const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
        if (!target) return res.status(404).json({ error: 'User not found' });
        if (target.id === req.session.userId) return res.status(400).json({ error: 'Cannot follow yourself' });

        const existing = db.prepare('SELECT id FROM followers WHERE follower_id = ? AND following_id = ?')
            .get(req.session.userId, target.id);

        if (existing) {
            db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?').run(req.session.userId, target.id);
        } else {
            db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(req.session.userId, target.id);
        }

        const count = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(target.id);
        res.json({ following: !existing, follower_count: count.count });
    } catch (err) {
        console.error('Follow error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search users
router.get('/api/users', (req, res) => {
    try {
        const q = req.query.q || '';
        if (q.length < 2) return res.json([]);

        const users = db.prepare(`
      SELECT id, username, display_name, avatar
      FROM users
      WHERE username LIKE ? OR display_name LIKE ?
      LIMIT 10
    `).all(`%${q}%`, `%${q}%`);

        res.json(users);
    } catch (err) {
        console.error('Search users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
