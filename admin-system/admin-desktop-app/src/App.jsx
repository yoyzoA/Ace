import { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sun,
  X
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Login from './components/Login';
import CommandPalette from './components/CommandPalette';
import { ConfirmProvider, ToastProvider } from './components/ui';
import { DataProvider, useData } from './store';
import { clearToken, getToken, MOCK_MODE, setUnauthorizedHandler } from './api/adminApi';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag }
];

/* ---------- Theme: system, light or dark, remembered on this computer ---------- */

const THEME_KEY = 'ace_admin_theme';
const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch {
    return 'system';
  }
};

function useTheme() {
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  const next = { system: 'light', light: 'dark', dark: 'system' };
  return [theme, () => setTheme((t) => next[t])];
}

const themeIcon = { system: Monitor, light: Sun, dark: Moon };
const themeLabel = { system: 'Theme: match system', light: 'Theme: light', dark: 'Theme: dark' };

/* ---------- Page from the address hash, so a reload keeps your place ---------- */

const pageFromHash = () => {
  const id = window.location.hash.replace('#', '');
  return PAGES.some((p) => p.id === id) ? id : 'dashboard';
};

function Shell({ onLogout }) {
  const [page, setPage] = useState(pageFromHash);
  const [intent, setIntent] = useState(null); // e.g. { edit: productId } or { open: orderId }
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, cycleTheme] = useTheme();
  const { orders, summary, loadOrders } = useData();

  const navigate = useCallback((nextPage, nextIntent = null) => {
    setPage(nextPage);
    setIntent(nextIntent);
    setMenuOpen(false);
    window.history.replaceState(null, '', `#${nextPage}`);
  }, []);

  useEffect(() => {
    if (!orders.data && !orders.loading) loadOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Back/forward and links that change the #page.
  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Ctrl+K / Cmd+K opens quick search.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pending =
    orders.data?.filter((o) => o.status === 'Pending').length ?? summary.data?.pendingOrders ?? 0;
  const ThemeIcon = themeIcon[theme];

  const nav = (
    <nav className="space-y-1" aria-label="Main">
      {PAGES.map((item) => {
        const Icon = item.icon;
        const active = page === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className={`h-[18px] w-[18px] ${active ? 'text-brand' : ''}`} aria-hidden="true" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === 'orders' && pending > 0 ? (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-sidebar">{pending}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  const sidebarBody = (
    <>
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1"><img src="./ace-logo-mark.png" alt="" className="h-full w-full object-contain" /></span>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-white">ACE Computers</p>
          <p className="text-[11px] text-white/50">Admin console</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          setPaletteOpen(true);
        }}
        className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded border border-white/15 px-1.5 text-[10px] font-semibold text-white/50">Ctrl K</kbd>
      </button>
      {nav}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        {MOCK_MODE ? (
          <p className="mb-2 rounded-lg bg-brand/15 px-3 py-2 text-xs text-brand">Preview with sample data</p>
        ) : null}
        <button
          type="button"
          onClick={cycleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ThemeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          {themeLabel[theme]}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </>
  );

  const pageProps = { navigate, intent, clearIntent: () => setIntent(null) };

  return (
    <div className="flex h-full">
      {/* Fixed sidebar on wide windows */}
      <aside className="hidden w-60 shrink-0 flex-col gap-5 bg-sidebar px-3 py-5 lg:flex">{sidebarBody}</aside>

      {/* Slide-in menu on narrow windows */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 animate-fade-in bg-black/50" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <aside className="relative flex h-full w-72 max-w-[85%] animate-fade-in flex-col gap-5 bg-sidebar px-3 py-5">
            <button type="button" className="absolute right-3 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebarBody}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar on narrow windows */}
        <header className="flex items-center gap-2 border-b border-line bg-panel px-3 py-2 lg:hidden">
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <img src="./ace-logo-mark.png" alt="" className="h-6 w-6 object-contain" />
          <span className="font-display font-semibold text-ink">{PAGES.find((p) => p.id === page)?.label}</span>
          <button type="button" className="icon-btn ml-auto" onClick={() => setPaletteOpen(true)} aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
        </header>

        <main className="scroll-thin min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            {page === 'dashboard' ? <Dashboard {...pageProps} /> : null}
            {page === 'products' ? <Products {...pageProps} /> : null}
            {page === 'orders' ? <Orders {...pageProps} /> : null}
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} navigate={navigate} />
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));

  useEffect(() => {
    setUnauthorizedHandler(() => setAuthed(false));
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        {authed ? (
          <DataProvider>
            <Shell
              onLogout={() => {
                clearToken();
                setAuthed(false);
              }}
            />
          </DataProvider>
        ) : (
          <Login onSuccess={() => setAuthed(true)} />
        )}
      </ConfirmProvider>
    </ToastProvider>
  );
}
