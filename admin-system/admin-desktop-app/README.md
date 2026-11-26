# ACE Admin (desktop app)

Electron + React console for running acecomputerslb.com: products, stock, orders and sales.
It starts its own admin server (`../admin-backend`) in the background.

## What it does

- **Dashboard**: sales for the last 7 or 30 days, orders waiting to be delivered, best sellers,
  and a catalog check (out of stock, running low, no photo, hidden). Every tile opens the matching list.
- **Products**: views (on website, hidden, featured, no photo, low and out of stock), search, category
  and brand filters, sorting, 50 per page. Click a price or stock number to change it in place. The
  Website switch and the featured star save immediately. Tick several products to show, hide,
  feature, move to a category or delete them together. Export the current list to Excel (CSV).
- **Product editor** (side panel): details, subcategory, photo links with previews and ordering,
  specifications, duplicate and delete.
- **Orders**: pending / all / completed / cancelled tabs, search by number, customer, phone or
  product, date range, and orders waiting 2+ days flagged. The order panel has WhatsApp, call and
  copy buttons, a copyable order summary, and Mark as delivered / Cancel.
- **Everywhere**: quick search with Ctrl+K, `/` to search products, light/dark theme, and a layout
  that adapts down to a narrow window.

## Setup

```
cd admin-system/admin-backend && npm install
cd ../admin-desktop-app && npm install
```

**Installed app:** on first run it asks for the database connection string and the admin email and
password (or loads them from an existing `.env` file), creates a strong sign-in key, and stores them in
`%APPDATA%\ACE Admin\admin-settings.env` on that PC. The installer itself contains no secrets, so it
can be copied to another PC safely. Change them later from **Connection settings** in the sidebar.

**Development:** `admin-system/admin-backend/.env` (see `.env.example`) needs `MONGODB_URI`,
`JWT_SECRET` (32+ random characters), `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

**Security:** the admin server only accepts connections from the same computer (127.0.0.1), and
sign-in pauses for 15 minutes after 5 wrong attempts.

## Run

```
npm run dev          # development, with hot reload
npm run dist:win     # build the Windows installer into release\
```

## Preview with sample data

```
# PowerShell
$env:VITE_ADMIN_MOCK="true"; npm run dev:renderer
```

Opens the console at http://localhost:5173 with made-up orders and a sample of the catalog. Nothing
is read from or written to the database in this mode.
