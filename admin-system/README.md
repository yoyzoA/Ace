# Ace Admin System

This folder contains the admin-only backend API and the Electron desktop admin app.

## 1) Admin backend

```
cd admin-system/admin-backend
npm install
```

Update `admin-system/admin-backend/.env` with your MongoDB URI and admin credentials, then start the server:

```
npm run dev
```

Default base URL: `http://localhost:4000`.
Products, categories, and brands are served from the `/admin/*` routes and protected by JWT or API key auth.

## 2) Admin desktop app

```
cd admin-system/admin-desktop-app
npm install
```

Create a `.env` in `admin-system/admin-desktop-app` if you want to override defaults:

```
VITE_ADMIN_API_BASE_URL=http://localhost:4000
VITE_ADMIN_LOGIN_PATH=/admin/login
VITE_ADMIN_API_KEY_HEADER=x-api-key
VITE_ADMIN_API_KEY_PREFIX=
VITE_ADMIN_JWT_PREFIX=Bearer
```

Run the app:

```
npm run dev
```
