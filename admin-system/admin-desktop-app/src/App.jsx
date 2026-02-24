import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="flex w-72 flex-col gap-6 border-r border-outline bg-white/60 px-6 py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Admin Console
            </p>
            <h2 className="mt-3 text-xl font-semibold text-ink">Ace Commerce</h2>
          </div>

          <nav className="space-y-3">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'products', label: 'Products' },
              { id: 'orders', label: 'Orders' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  activePage === item.id
                    ? 'border-accent bg-accent text-white'
                    : 'border-outline bg-panel/70 text-ink'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="animate-fade-up">
            {activePage === 'dashboard' ? <Dashboard /> : null}
            {activePage === 'products' ? <Products /> : null}
            {activePage === 'orders' ? <Orders /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
