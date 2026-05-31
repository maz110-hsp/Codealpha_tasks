function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

function guestOnly(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    next();
}

function attachUser(req, res, next) {
    if (req.session && req.session.userId) {
        const db = require('../db');
        const user = db.prepare('SELECT id, username, display_name, avatar FROM users WHERE id = ?').get(req.session.userId);
        req.user = user || null;
    } else {
        req.user = null;
    }
    next();
}

module.exports = { requireLogin, guestOnly, attachUser };
