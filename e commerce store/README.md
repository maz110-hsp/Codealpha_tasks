
## Requirements

- Node.js `20.19+` or `22.12+` is recommended for Vite 7.
- npm.

## Environment Setup

Create .env` file 

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
```

## Install Dependencies

From the project root:

```bash
npm install
npm install --prefix frontend
npm install --prefix admin
```


## Seed Demo Data

Make sure MongoDB is running, then run:

```bash
npm run data:import
```

Seeded accounts:

```text
Admin: admin@example.com / 123456
User: john@example.com / 123456
User: jane@example.com / 123456
```

To clear seeded data:

```bash
npm run data:destroy
```

## Run Everything Together

From the project root:

```bash
npm run dev
```

This starts:

- Backend API on `http://localhost:5000`
- Storefront on `http://localhost:5173`
- Admin dashboard on `http://localhost:5174`

## Run Apps Separately

Backend:

```bash
npm run server
```

Storefront:

```bash
npm run client
```

Admin dashboard:

```bash
npm run admin
```

## Production Builds

Build both Vite apps:

```bash
npm run build
```

Or build individually:

```bash
npm run build --prefix frontend
npm run build --prefix admin
```

## Notes

- Credit/debit card payment is currently a local demo authorization flow. It does not send real card details to Stripe.
- Bank transfer payments are marked paid by an admin after verification.
- Cash on Delivery payments stay pending until handled operationally.
- Admin users should be created through seeded data or the admin user edit flow, not public registration.
