const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'socialapp-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// Attach user middleware
const { attachUser } = require('./middleware/auth');
app.use(attachUser);

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const feedRoutes = require('./routes/feed');

app.use(authRoutes);
app.use(postRoutes);
app.use(commentRoutes);
app.use(userRoutes);
app.use(feedRoutes);

// Serve main pages
app.get('/', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile('feed.html', { root: './views' });
});

app.get('/explore', (req, res) => {
    res.sendFile('feed.html', { root: './views' });
});

app.get('/post/:id', (req, res) => {
    res.sendFile('post.html', { root: './views' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log(`SocialApp running at http://localhost:${PORT}`);
});
