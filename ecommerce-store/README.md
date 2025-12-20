# ACE Computers SARL (Catalog)

A modern, catalog-only electronics storefront for ACE Computers SARL in Batroun, Lebanon. Browse products, compare specs, and explore categories with a clean, tech-forward UI.

## Features

- Catalog browsing with filters for category, brand, and price
- Featured products and product detail pages
- REST API with MongoDB schema and seed data
- Centralized API layer for easy swap from mock data to backend
- Tailwind theme configuration with reusable tokens

## Tech stack

Frontend
- React + Vite
- JavaScript (ES6+)
- Tailwind CSS

Backend
- Node.js + Express
- MongoDB + Mongoose

## Project structure

```
ecommerce-store/
  frontend/
    src/
      components/
      pages/
      services/
      data/
      App.jsx
      main.jsx
  backend/
    models/
    routes/
    controllers/
    server.js
    seed.js
  README.md
```

## Getting started

### Backend

1. Copy env file and update the MongoDB URI if needed:

```
cd backend
cp .env.example .env
```

2. Install dependencies and seed the database:

```
npm install
npm run seed
```

3. Start the API:

```
npm run dev
```

API runs on `http://localhost:5000` by default.

### Frontend

1. Copy env file and configure data source:

```
cd frontend
cp .env.example .env
```

Set `VITE_USE_MOCK_DATA=true` to use local mock data. Set to `false` to use the backend API.
Update `VITE_API_BASE_URL` if your backend runs on a different host or port.

2. Install dependencies and run the dev server:

```
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## AWS deployment preparation

See `ecommerce-store/deployment/aws.md` for Elastic Beanstalk and S3/CloudFront preparation steps and CLI command templates.

## Branding

- Logo path is configured in `frontend/src/data/siteConfig.js` as `logo: '/ace-logo.png'`.
- Replace `frontend/public/ace-logo.png` with your official logo (same filename), or update the path in `siteConfig.js`.

## API endpoints

- `GET /api/products`
- `GET /api/products/:id`

Filters supported via query params:
- `category`
- `brand`
- `featured=true`
- `minPrice`
- `maxPrice`

## Future-ready notes

- Placeholder UI hooks are in place for cart and account flows.
- The API layer is centralized in `frontend/src/services/api.js` for easy expansion.
- The product schema is ready for inventory, reviews, and admin-managed metadata.

## What is intentionally omitted

- Authentication
- Shopping cart and checkout
- Admin dashboard
