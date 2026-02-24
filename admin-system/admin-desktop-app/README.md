# Ace Admin Desktop App

Electron + React admin console for product management backed by the admin API.

## Setup

1. Install dependencies:

```
cd admin-system/admin-desktop-app
npm install
```

2. Configure environment variables (Vite uses the `VITE_` prefix):

```
VITE_ADMIN_API_BASE_URL=http://localhost:4000
```

For development, set `VITE_ADMIN_API_BASE_URL` to your dev backend URL.

## Development

```
npm run dev
```

## Production build

```
npm run build
```

## Windows packaging

```
npm run dist:win
```

The packaged build lands in `admin-system\admin-desktop-app\release`.
The product form manages name, price, category, brand, description, featured state, image URLs, and specs. Categories and brands are loaded from `/admin/categories` and `/admin/brands`.
