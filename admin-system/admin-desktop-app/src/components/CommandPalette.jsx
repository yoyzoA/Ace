import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, LayoutDashboard, Package, Plus, Search, ShoppingBag } from 'lucide-react';
import { useData } from '../store';
import { productId } from '../api/adminApi';
import { formatMoney, orderNumber } from '../lib/format';
import { StatusBadge, Thumb } from './ui';

// Quick search across pages, products and orders (Ctrl+K).
export default function CommandPalette({ open, onClose, navigate }) {
  const { products, orders, loadProducts, loadOrders } = useData();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);
    if (!products.data && !products.loading) loadProducts();
    if (!orders.data && !orders.loading) loadOrders();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const actions = [
      { key: 'go-dashboard', group: 'Go to', label: 'Dashboard', icon: LayoutDashboard, run: () => navigate('dashboard') },
      { key: 'go-products', group: 'Go to', label: 'Products', icon: Package, run: () => navigate('products') },
      { key: 'go-orders', group: 'Go to', label: 'Orders', icon: ShoppingBag, run: () => navigate('orders') },
      { key: 'new-product', group: 'Actions', label: 'Add a product', icon: Plus, run: () => navigate('products', { create: true }) }
    ].filter((a) => !q || a.label.toLowerCase().includes(q));

    if (!q) return actions;

    const words = q.split(/\s+/);
    const matches = (text) => words.every((w) => text.includes(w));

    const productHits = (products.data || [])
      .filter((p) => matches(`${p.name} ${p.brand} ${p.category}`.toLowerCase()))
      .slice(0, 6)
      .map((p) => ({
        key: `p-${productId(p)}`,
        group: 'Products',
        label: p.name,
        hint: `${formatMoney(p.price)} · ${p.published === false ? 'Hidden' : 'On website'}`,
        image: p.images?.[0],
        run: () => navigate('products', { edit: productId(p) })
      }));

    const orderHits = (orders.data || [])
      .filter((o) => matches(`${orderNumber(o)} ${o.customer?.name} ${o.customer?.phone}`.toLowerCase().replace('#', '')) || orderNumber(o).toLowerCase().includes(q))
      .slice(0, 5)
      .map((o) => ({
        key: `o-${productId(o)}`,
        group: 'Orders',
        label: `${orderNumber(o)} · ${o.customer?.name || 'Guest'}`,
        hint: formatMoney(o.total),
        status: o.status,
        run: () => navigate('orders', { open: productId(o) })
      }));

    return [...actions, ...productHits, ...orderHits];
  }, [query, products.data, orders.data, navigate]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const choose = (item) => {
    onClose();
    item?.run();
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  let lastGroup = null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <button type="button" className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} aria-label="Close search" />
      <div role="dialog" aria-modal="true" aria-label="Quick search" className="relative w-full max-w-xl animate-fade-up overflow-hidden rounded-2xl border border-line bg-panel shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search products, orders, customers…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
            aria-label="Search"
          />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:block">Esc</kbd>
        </div>
        <div ref={listRef} className="scroll-thin max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">
              {products.loading || orders.loading ? 'Loading…' : `Nothing matches “${query}”.`}
            </p>
          ) : (
            results.map((item, index) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              const Icon = item.icon;
              return (
                <div key={item.key}>
                  {showGroup ? <p className="eyebrow px-3 pb-1 pt-3">{item.group}</p> : null}
                  <button
                    type="button"
                    data-index={index}
                    onMouseMove={() => setActive(index)}
                    onClick={() => choose(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                      index === active ? 'bg-accentSoft text-ink' : 'text-ink'
                    }`}
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
                    ) : item.group === 'Products' ? (
                      <Thumb src={item.image} size="h-8 w-8" />
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.status ? <StatusBadge status={item.status} /> : null}
                    {item.hint ? <span className="shrink-0 text-xs text-muted tabular">{item.hint}</span> : null}
                    {index === active ? <CornerDownLeft className="h-3.5 w-3.5 text-muted" aria-hidden="true" /> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
