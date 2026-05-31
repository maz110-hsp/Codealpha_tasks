const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { guestOnly } = require('../middleware/auth');
const router = express.Router();

// GET login page
router.get('/login', guestOnly, (req, res) => {
    res.sendFile('login.html', { root: './views' });
});

// GET register page
router.get('/register', guestOnly, (req, res) => {
    res.sendFile('register.html', { root: './views' });
});

// POST register
router.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, display_name } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: 'Username must be 3-20 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existing) {
            return res.status(400).json({ error: 'Username or email already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = db.prepare(
            'INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)'
        ).run(username, email, hashedPassword, display_name || username);

        req.session.userId = result.lastInsertRowid;
        res.json({ success: true, redirect: '/' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST login
router.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        res.json({ success: true, redirect: '/' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST logout
router.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ success: true, redirect: '/login' });
    });
});

// GET current user
router.get('/api/auth/me', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = db.prepare('SELECT id, username, display_name, avatar, bio FROM users WHERE id = ?').get(req.session.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(user);
});

module.exports = router;
