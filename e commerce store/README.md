# PROStore — MERN E-Commerce Platform

A full-stack e-commerce application with a customer storefront, admin dashboard, and REST API. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### Storefront (`frontend`)
- Browse products with search and category filters
- Product detail pages with add-to-cart
- Shopping cart with quantity controls
- User registration and login (JWT + HTTP-only cookies)
- Checkout flow: shipping → payment → place order
- Order history and profile management
- Light / dark theme toggle

### Admin Dashboard (`admin`)
- Admin-only authentication
- Dashboard overview
- Product management (create, edit, delete, image upload)
- Order management (view orders, update delivery status, mark bank transfers as paid)
- User management (view users, edit roles and details)

### Backend API (`backend`)
- RESTful API with Express
- MongoDB data persistence with Mongoose
- JWT authentication and role-based access (admin / user)
- Image uploads via Cloudinary
- Multiple payment methods: Cash on Delivery, Bank Transfer, Credit/Debit Card (demo flow)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite 7, Redux Toolkit, React Router |
| Admin | React 19, Vite 7, Redux Toolkit, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JSON Web Tokens, bcrypt, cookie-parser |
| Other | Cloudinary, Multer, Stripe (dependency present; card flow is demo-only) |

## Project Structure

```text
e-commerce-store/
├── backend/          # Express API, models, controllers, routes
├── frontend/         # Customer storefront (port 5173)
├── admin/            # Admin dashboard (port 5174)
├── package.json      # Root scripts and backend dependencies
└── README.md
```

## Requirements

- **Node.js** `20.19+` or `22.12+` (recommended for Vite 7)
- **npm**
- **MongoDB** (local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd e-commerce-store
```

### 2. Install dependencies

From the project root:

```bash
npm install
npm install --prefix frontend
npm install --prefix admin
```

### 3. Environment variables

Create a `.env` file in the **project root** (do not commit this file):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
BANK_NAME=Demo Commerce Bank
BANK_ACCOUNT_TITLE=PROStore Pvt Ltd
BANK_ACCOUNT_NUMBER=PK00-DEMO-0000-0000

# Optional — required only for product image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> Use placeholder values in documentation only. Never commit real secrets to GitHub.

### 4. Seed demo data

Make sure MongoDB is running, then:

```bash
npm run data:import
```

**Demo accounts:**

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | admin@example.com | 123456   |
| User  | john@example.com  | 123456   |
| User  | jane@example.com  | 123456   |

To remove seeded data:

```bash
npm run data:destroy
```

### 5. Run the application

**All apps together (recommended for development):**

```bash
npm run dev
```

| App        | URL                        |
|------------|----------------------------|
| Backend    | http://localhost:5000      |
| Storefront | http://localhost:5173      |
| Admin      | http://localhost:5174      |

**Run individually:**

```bash
npm run server   # Backend only
npm run client   # Storefront only
npm run admin    # Admin dashboard only
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend, storefront, and admin concurrently |
| `npm run server` | Start backend with nodemon |
| `npm run client` | Start storefront dev server |
| `npm run admin` | Start admin dev server |
| `npm start` | Start backend in production mode |
| `npm run build` | Build frontend and admin for production |
| `npm run data:import` | Import demo users and products |
| `npm run data:destroy` | Delete all seeded data |

## API Overview

| Route | Description |
|-------|-------------|
| `GET /api/products` | List products (supports keyword search) |
| `GET /api/products/:id` | Get single product |
| `POST /api/users` | Register user |
| `POST /api/users/auth` | Login |
| `POST /api/orders` | Create order (authenticated) |
| `GET /api/orders/myorders` | Get logged-in user's orders |
| `POST /api/upload` | Upload product image (admin, Cloudinary) |

## Payment Notes

- **Credit/Debit Card** — Demo authorization flow only. Real card data is not sent to Stripe.
- **Bank Transfer** — Customer receives bank details at checkout; an admin marks the order as paid after verification.
- **Cash on Delivery** — Order stays pending until handled operationally.

## Production Build

Build both Vite apps:

```bash
npm run build
```

Or build individually:

```bash
npm run build --prefix frontend
npm run build --prefix admin
```

## What Not to Upload to GitHub

Do **not** commit these folders/files:

- `node_modules/` (reinstall with `npm install`)
- `.env` (contains secrets — recreate locally from the template above)
- `dist/` (generated build output)

## License

This project is open source and available for learning and portfolio use.
