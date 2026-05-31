# SocialApp

A lightweight social media web application built with Node.js and Express. Users can register, post updates with images, follow others, like and comment on posts, and manage their profile.

Designed to run locally for learning and portfolio use. The included database contains **demo accounts and sample content only**.

## Features

- **Authentication** — Register, log in, log out with session-based auth and bcrypt password hashing
- **Feed** — Personalized home feed from people you follow, plus your own posts
- **Explore** — Browse recent posts from all users
- **Posts** — Create text posts with optional images; like and delete your own posts
- **Comments** — Add and delete comments on posts
- **Profiles** — View user profiles, edit display name, bio, and avatar
- **Follow system** — Follow and unfollow users; view followers and following lists
- **Avatars** — Upload a profile picture or reset to the default avatar

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Server | Express |
| Database | SQLite (`better-sqlite3`) |
| Auth | `express-session`, `bcrypt` |
| File uploads | `multer` |
| Frontend | HTML, CSS, vanilla JavaScript |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd Social-media-app
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub details.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

For development with auto-restart on file changes:

```bash
npm run dev
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000) in your browser.

You will be redirected to the login page. Register a new account or use the demo users already in the bundled database (if present).

## Project Structure

```
Social-media-app/
├── server.js           # Express app entry point
├── db.js               # SQLite schema and connection
├── middleware/
│   └── auth.js         # Login guards and current user helper
├── routes/
│   ├── auth.js         # Register, login, logout
│   ├── feed.js         # Home feed and explore
│   ├── posts.js        # Posts, likes, image uploads
│   ├── comments.js     # Comments on posts
│   └── users.js        # Profiles, follow, avatars
├── views/              # HTML pages
├── public/
│   ├── css/            # Styles
│   ├── js/             # Client-side logic
│   └── uploads/        # User avatars and post images
└── socialapp.db        # SQLite database (demo data)
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/feed` | Personalized feed (auth required) |
| GET | `/api/explore` | All recent posts |
| POST | `/api/posts` | Create post (optional image) |
| POST | `/api/posts/:id/like` | Like or unlike |
| GET/POST | `/api/posts/:postId/comments` | List or add comments |
| GET | `/api/users/:username` | User profile |
| POST | `/api/users/:username/follow` | Follow or unfollow |
| PUT | `/api/users/profile` | Update profile / avatar |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |

Example:

```bash
PORT=4000 npm start
```

## Security Notes

This project is intended for **local development and demonstration**:

- Passwords are stored as bcrypt hashes, not plain text.
- The session secret in `server.js` is a development placeholder. If you deploy this app publicly, set a strong `SESSION_SECRET` environment variable and use HTTPS.
- Do not use the bundled demo database for real user data in production.

## Troubleshooting

- **Port in use** — Set another port: `PORT=3001 npm start`
- **Upload errors** — Ensure `public/uploads/` exists (created automatically on start)
- **Stale UI** — Hard refresh the browser (`Ctrl+Shift+R`) or clear cache
- **Server issues** — Check the terminal for errors; restart with `npm start`

## License

This project is open source for educational and portfolio purposes. Add a license file if you need a specific one (e.g. MIT).


