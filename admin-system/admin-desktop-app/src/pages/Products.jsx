import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  FolderInput,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X
} from 'lucide-react';
import ProductEditor from '../components/ProductEditor';
import { EmptyState, ErrorBanner, Skeleton, Switch, Thumb, useConfirm, useToast } from '../components/ui';
import { useData } from '../store';
import {
  bulkDeleteProducts,
  bulkUpdateProducts,
  createBrand,
  createCategory,
  createProduct,
  deleteProduct,
  getErrorMessage,
  productId,
  updateProduct
} from '../api/adminApi';
import { available, formatMoney, isSecondHand, timeAgo } from '../lib/format';
import { downloadCsv, today } from '../lib/csv';

const PAGE_SIZE = 50;
const LOW_STOCK = 2;

const VIEWS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'shown', label: 'On website', test: (p) => p.published !== false },
  { id: 'hidden', label: 'Hidden', test: (p) => p.published === false },
  { id: 'featured', label: 'Featured', test: (p) => p.featured },
  { id: 'secondHand', label: 'Second-hand', test: (p) => isSecondHand(p) },
  { id: 'noPhoto', label: 'No photo', test: (p) => !(p.images || []).length },
  { id: 'low', label: 'Low stock', test: (p) => available(p) > 0 && available(p) <= LOW_STOCK },
  { id: 'out', label: 'Out of stock', test: (p) => available(p) <= 0 }
];

const SORTS = [
  { id: 'updated', label: 'Recently updated', fn: (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0) },
  { id: 'name', label: 'Name A–Z', fn: (a, b) => String(a.name).localeCompare(String(b.name)) },
  { id: 'priceAsc', label: 'Price: low to high', fn: (a, b) => (a.price || 0) - (b.price || 0) },
  { id: 'priceDesc', label: 'Price: high to low', fn: (a, b) => (b.price || 0) - (a.price || 0) },
  { id: 'stockAsc', label: 'Stock: lowest first', fn: (a, b) => available(a) - available(b) },
  { id: 'stockDesc', label: 'Stock: highest first', fn: (a, b) => available(b) - available(a) }
];

/* Click a price or stock to edit it in place. Enter saves, Escape cancels. */
function InlineNumber({ value, onSave, prefix = '', step = '1', label, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, value]);

  const commit = () => {
    setEditing(false);
    const next = Number(draft);
    if (draft === '' || !Number.isFinite(next) || next < 0 || next === Number(value)) return;
    onSave(next);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        step={step}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        aria-label={label}
        className="field w-24 px-2 py-1 tabular"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title={`Click to change ${label.toLowerCase()}`}
      className={`group -mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 tabular hover:bg-sunken ${className}`}
    >
      {prefix}
      {value}
      <Pencil className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
    </button>
  );
}

function StockCell({ product, onSave }) {
  const free = available(product);
  const tone = free <= 0 ? 'text-danger' : free <= LOW_STOCK ? 'text-warn' : 'text-ink';
  return (
    <div className="leading-tight">
      <InlineNumber value={Number(product.stock || 0)} onSave={onSave} label="Stock" className={`font-semibold ${tone}`} />
      {product.reserved ? <p className="text-[11px] text-muted">{product.reserved} on hold</p> : null}
      {free <= 0 ? <p className="text-[11px] font-semibold text-danger">Out of stock</p> : null}
    </div>
  );
}

function RowMenu({ onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const item = 'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sunken';
  return (
    <div ref={ref} className="relative">
      <button type="button" className="icon-btn h-8 w-8" onClick={() => setOpen((o) => !o)} aria-label="More actions" aria-expanded={open}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-40 animate-fade-in overflow-hidden rounded-lg border border-line bg-panel py-1 shadow-pop">
          <button type="button" className={item} onClick={() => (setOpen(false), onEdit())}>
            <Pencil className="h-4 w-4 text-muted" /> Edit
          </button>
          <button type="button" className={item} onClick={() => (setOpen(false), onDuplicate())}>
            <Copy className="h-4 w-4 text-muted" /> Duplicate
          </button>
          <button type="button" className={`${item} text-danger`} onClick={() => (setOpen(false), onDelete())}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Products({ intent, clearIntent }) {
  const { products, lists, loadProducts, patchProducts, replaceProduct, removeProducts } = useData();
  const toast = useToast();
  const confirm = useConfirm();

  const [view, setView] = useState('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState('updated');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [editor, setEditor] = useState({ open: false, product: null, template: null });
  const [saving, setSaving] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [moveTo, setMoveTo] = useState('');
  const searchRef = useRef(null);

  const all = products.data || [];

  useEffect(() => {
    if (!products.data && !products.loading) loadProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "/" focuses the search box.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Requests from other pages or quick search: open a product, start a new one, or pick a view.
  useEffect(() => {
    if (!intent) return;
    if (intent.view) setView(intent.view);
    if (intent.create) setEditor({ open: true, product: null, template: null });
    if (intent.edit && all.length) {
      const product = all.find((p) => productId(p) === intent.edit);
      if (product) setEditor({ open: true, product, template: null });
    }
    if (!intent.edit || all.length) clearIntent();
  }, [intent, all.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => Object.fromEntries(VIEWS.map((v) => [v.id, all.filter(v.test).length])), [all]);

  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const viewTest = VIEWS.find((v) => v.id === view)?.test || (() => true);
    const list = all.filter((p) => {
      if (!viewTest(p)) return false;
      if (category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (!words.length) return true;
      const text = `${p.name} ${p.brand} ${p.category} ${p.subcategory || ''}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
    return list.sort(SORTS.find((s) => s.id === sort)?.fn);
  }, [all, view, query, category, brand, sort]);

  useEffect(() => setPage(1), [view, query, category, brand, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedIds = [...selected];
  const allOnPageSelected = pageItems.length > 0 && pageItems.every((p) => selected.has(productId(p)));
  const filtersOn = Boolean(query || category || brand || view !== 'all');

  const toggleOne = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const togglePage = () =>
    setSelected((s) => {
      const next = new Set(s);
      pageItems.forEach((p) => (allOnPageSelected ? next.delete(productId(p)) : next.add(productId(p))));
      return next;
    });

  /* ---------- Single-product changes ---------- */

  const quickUpdate = async (product, changes, message) => {
    const id = productId(product);
    const before = Object.fromEntries(Object.keys(changes).map((k) => [k, product[k]]));
    patchProducts([id], changes);
    try {
      await updateProduct(id, changes);
      if (message) toast(message);
    } catch (error) {
      patchProducts([id], before);
      toast({ tone: 'error', message: getErrorMessage(error) });
    }
  };

  const ensureListed = async (form) => {
    const has = (list, value) => list.some((v) => v.toLowerCase() === value.trim().toLowerCase());
    await Promise.all([
      form.category && !has(lists.categories, form.category) ? createCategory(form.category.trim()).catch(() => null) : null,
      form.brand && !has(lists.brands, form.brand) ? createBrand(form.brand.trim()).catch(() => null) : null
    ]);
  };

  const save = async (form) => {
    setSaving(true);
    try {
      await ensureListed(form);
      const saved = editor.product ? await updateProduct(productId(editor.product), form) : await createProduct(form);
      replaceProduct(saved);
      toast(editor.product ? 'Changes saved.' : `Added “${saved.name}”.`);
      setEditor({ open: false, product: null, template: null });
    } catch (error) {
      toast({ tone: 'error', message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    const ok = await confirm({
      title: `Delete “${product.name}”?`,
      message: 'This removes it from the website and the admin app for good. To take it off the website but keep it here, hide it instead.',
      confirmLabel: 'Delete product',
      danger: true
    });
    if (!ok) return;
    try {
      await deleteProduct(productId(product));
      removeProducts([productId(product)]);
      setEditor({ open: false, product: null, template: null });
      toast('Product deleted.');
    } catch (error) {
      toast({ tone: 'error', message: getErrorMessage(error) });
    }
  };

  const duplicate = (product) =>
    setEditor({
      open: true,
      product: null,
      template: { ...product, name: `${product.name} (copy)`, published: false, stock: 0 }
    });

  /* ---------- Bulk changes ---------- */

  const bulk = async (set, label) => {
    setBulkBusy(true);
    try {
      await bulkUpdateProducts(selectedIds, set);
      patchProducts(selectedIds, set);
      toast(`${label} ${selectedIds.length} product${selectedIds.length === 1 ? '' : 's'}.`);
      setSelected(new Set());
      setMoveTo('');
    } catch (error) {
      toast({ tone: 'error', message: getErrorMessage(error) });
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    const n = selectedIds.length;
    const ok = await confirm({
      title: `Delete ${n} product${n === 1 ? '' : 's'}?`,
      message: 'They are removed for good. Hiding them keeps them in the admin app.',
      confirmLabel: `Delete ${n}`,
      danger: true
    });
    if (!ok) return;
    setBulkBusy(true);
    try {
      await bulkDeleteProducts(selectedIds);
      removeProducts(selectedIds);
      setSelected(new Set());
      toast(`Deleted ${n} product${n === 1 ? '' : 's'}.`);
    } catch (error) {
      toast({ tone: 'error', message: getErrorMessage(error) });
    } finally {
      setBulkBusy(false);
    }
  };

  const exportCsv = () => {
    downloadCsv(`ace-products-${today()}.csv`, [
      { label: 'Name', value: (p) => p.name },
      { label: 'Brand', value: (p) => p.brand },
      { label: 'Category', value: (p) => p.category },
      { label: 'Subcategory', value: (p) => p.subcategory },
      { label: 'Price', value: (p) => p.price },
      { label: 'Stock', value: (p) => p.stock || 0 },
      { label: 'On hold', value: (p) => p.reserved || 0 },
      { label: 'On website', value: (p) => (p.published === false ? 'No' : 'Yes') },
      { label: 'Featured', value: (p) => (p.featured ? 'Yes' : 'No') },
      { label: 'Photos', value: (p) => (p.images || []).length },
      { label: 'ID', value: (p) => productId(p) }
    ], filtered);
    toast(`Exported ${filtered.length} products.`);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setBrand('');
    setView('all');
  };

  /* ---------- Render ---------- */

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="page-title">Products</h1>
          {products.data ? (
            <p className="mt-1 text-sm text-muted">
              {counts.shown} on the website · {counts.hidden} hidden · {counts.noPhoto} without a photo
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={loadProducts} disabled={products.loading}>
            <RefreshCw className={`h-4 w-4 ${products.loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button type="button" className="btn-secondary" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button type="button" className="btn-primary" onClick={() => setEditor({ open: true, product: null, template: null })}>
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>
      </div>

      {/* Views */}
      <div className="scroll-thin -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-xl border border-line bg-panel p-1" role="tablist" aria-label="Product views">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                view === v.id ? 'bg-accent text-white' : 'text-muted hover:bg-sunken hover:text-ink'
              }`}
            >
              {v.label}
              <span className={`tabular text-xs ${view === v.id ? 'text-white/80' : 'text-muted/80'}`}>{counts[v.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, brand or category   ( / )"
            className="field pl-9"
            aria-label="Search products"
          />
        </div>
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {lists.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="field" value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand">
          <option value="">All brands</option>
          {lists.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <div className="relative">
          <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <select className="field pl-9" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {filtersOn ? (
          <button type="button" className="btn-ghost" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Clear
          </button>
        ) : null}
      </div>

      <ErrorBanner message={products.error} onRetry={loadProducts} />

      {/* Bulk actions */}
      {selected.size ? (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accentSoft px-3 py-2 shadow-card">
          <span className="mr-1 text-sm font-semibold text-ink">{selected.size} selected</span>
          <button type="button" className="btn-secondary py-1.5" disabled={bulkBusy} onClick={() => bulk({ published: true }, 'Now showing')}>
            <Eye className="h-4 w-4" /> Show
          </button>
          <button type="button" className="btn-secondary py-1.5" disabled={bulkBusy} onClick={() => bulk({ published: false }, 'Hid')}>
            <EyeOff className="h-4 w-4" /> Hide
          </button>
          <button type="button" className="btn-secondary py-1.5" disabled={bulkBusy} onClick={() => bulk({ featured: true }, 'Featured')}>
            <Star className="h-4 w-4" /> Feature
          </button>
          <button type="button" className="btn-secondary py-1.5" disabled={bulkBusy} onClick={() => bulk({ featured: false }, 'Unfeatured')}>
            Unfeature
          </button>
          <button type="button" className="btn-secondary py-1.5" disabled={bulkBusy} onClick={() => bulk({ condition: 'used' }, 'Marked as second-hand:')}>
            Second-hand
          </button>
          <button type="button" className="btn-secondary py-1.5" disabled={bulkBusy} onClick={() => bulk({ condition: 'new' }, 'Marked as new:')}>
            New
          </button>
          <div className="flex items-center gap-1">
            <select className="field w-auto py-1.5" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} aria-label="Move to category">
              <option value="">Move to category…</option>
              {lists.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {moveTo ? (
              <button type="button" className="btn-primary py-1.5" disabled={bulkBusy} onClick={() => bulk({ category: moveTo }, `Moved to ${moveTo}:`)}>
                <FolderInput className="h-4 w-4" /> Move
              </button>
            ) : null}
          </div>
          <button type="button" className="btn-ghost py-1.5 text-danger hover:text-danger" disabled={bulkBusy} onClick={bulkDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button type="button" className="btn-ghost ml-auto py-1.5" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      ) : null}

      {/* List */}
      {products.loading && !products.data ? (
        <div className="card divide-y divide-line">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : products.data && !filtered.length ? (
        <EmptyState
          icon={Package}
          title={all.length ? 'No products match' : 'No products yet'}
          message={all.length ? 'Try another search or clear the filters.' : 'Add your first product to get started.'}
          action={
            all.length ? (
              <button type="button" className="btn-secondary" onClick={clearFilters}>
                Clear filters
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setEditor({ open: true, product: null, template: null })}>
                <Plus className="h-4 w-4" /> Add product
              </button>
            )
          }
        />
      ) : products.data ? (
        <>
          {/* Table on wide windows */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full table-fixed text-sm">
              <thead className="border-b border-line bg-sunken/60 text-left text-xs font-semibold text-muted">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={allOnPageSelected} onChange={togglePage} aria-label="Select all on this page" />
                  </th>
                  <th className="px-2 py-3">Product</th>
                  <th className="w-28 px-3 py-3">Price</th>
                  <th className="w-28 px-3 py-3">Stock</th>
                  <th className="w-32 px-3 py-3">Website</th>
                  <th className="hidden w-24 px-3 py-3 text-center lg:table-cell">Featured</th>
                  <th className="hidden w-28 px-3 py-3 xl:table-cell">Updated</th>
                  <th className="w-14 px-3 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageItems.map((p) => {
                  const id = productId(p);
                  const isSelected = selected.has(id);
                  return (
                    <tr key={id} className={`transition-colors ${isSelected ? 'bg-accentSoft/60' : 'hover:bg-sunken/50'}`}>
                      <td className="px-4 py-2.5">
                        <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={isSelected} onChange={() => toggleOne(id)} aria-label={`Select ${p.name}`} />
                      </td>
                      <td className="px-2 py-2.5">
                        <button type="button" onClick={() => setEditor({ open: true, product: p, template: null })} className="flex w-full min-w-0 items-center gap-3 text-left">
                          <Thumb src={p.images?.[0]} />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-ink hover:text-accent">{p.name}</span>
                            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
                              {isSecondHand(p) ? <span className="chip shrink-0 bg-sunken text-ink">Second-hand</span> : null}
                              <span className="truncate">{[p.brand, p.category, p.subcategory].filter(Boolean).join(' · ')}</span>
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-ink">
                        <InlineNumber value={Number(p.price || 0)} prefix="$" step="0.01" label="Price" onSave={(price) => quickUpdate(p, { price }, `Price updated to ${formatMoney(price)}.`)} />
                      </td>
                      <td className="px-3 py-2.5">
                        <StockCell product={p} onSave={(stock) => quickUpdate(p, { stock }, 'Stock updated.')} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Switch
                            size="sm"
                            checked={p.published !== false}
                            onChange={(on) => quickUpdate(p, { published: on }, on ? 'Now on the website.' : 'Hidden from the website.')}
                            label={`Show ${p.name} on website`}
                          />
                          <span className="text-xs text-muted">{p.published === false ? 'Hidden' : 'Shown'}</span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-2.5 text-center lg:table-cell">
                        <button
                          type="button"
                          onClick={() => quickUpdate(p, { featured: !p.featured }, p.featured ? 'Removed from featured.' : 'Featured on the home page.')}
                          className={`icon-btn h-8 w-8 ${p.featured ? 'text-[#e9a23b] hover:text-[#e9a23b]' : ''}`}
                          aria-label={p.featured ? 'Remove from featured' : 'Feature on home page'}
                          aria-pressed={Boolean(p.featured)}
                        >
                          <Star className="h-4 w-4" fill={p.featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-2.5 text-xs text-muted xl:table-cell">{timeAgo(p.updatedAt)}</td>
                      <td className="px-3 py-2.5">
                        <RowMenu onEdit={() => setEditor({ open: true, product: p, template: null })} onDuplicate={() => duplicate(p)} onDelete={() => remove(p)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards on narrow windows */}
          <ul className="space-y-2 md:hidden">
            {pageItems.map((p) => {
              const id = productId(p);
              return (
                <li key={id} className={`card flex gap-3 p-3 ${selected.has(id) ? 'ring-2 ring-accent/40' : ''}`}>
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" checked={selected.has(id)} onChange={() => toggleOne(id)} aria-label={`Select ${p.name}`} />
                  <button type="button" onClick={() => setEditor({ open: true, product: p, template: null })} aria-label={`Edit ${p.name}`}>
                    <Thumb src={p.images?.[0]} size="h-14 w-14" />
                  </button>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <button type="button" onClick={() => setEditor({ open: true, product: p, template: null })} className="block w-full text-left">
                      <span className="line-clamp-2 font-medium text-ink">{p.name}</span>
                      <span className="block truncate text-xs text-muted">{[p.brand, p.category].filter(Boolean).join(' · ')}</span>
                    </button>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-semibold text-ink">
                        <InlineNumber value={Number(p.price || 0)} prefix="$" step="0.01" label="Price" onSave={(price) => quickUpdate(p, { price }, 'Price updated.')} />
                      </span>
                      <span className="text-xs text-muted">
                        Stock <StockCellInline product={p} onSave={(stock) => quickUpdate(p, { stock }, 'Stock updated.')} />
                      </span>
                      <span className="ml-auto flex items-center gap-2">
                        {p.featured ? <Star className="h-4 w-4 text-[#e9a23b]" fill="currentColor" aria-label="Featured" /> : null}
                        <Switch size="sm" checked={p.published !== false} onChange={(on) => quickUpdate(p, { published: on }, on ? 'Now on the website.' : 'Hidden from the website.')} label={`Show ${p.name} on website`} />
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span className="tabular">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            {pages > 1 ? (
              <div className="flex items-center gap-1">
                <button type="button" className="icon-btn" onClick={() => setPage((n) => Math.max(1, n - 1))} disabled={page === 1} aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="tabular px-2">
                  Page {page} of {pages}
                </span>
                <button type="button" className="icon-btn" onClick={() => setPage((n) => Math.min(pages, n + 1))} disabled={page === pages} aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <ProductEditor
        open={editor.open}
        product={editor.product}
        template={editor.template}
        onClose={() => setEditor({ open: false, product: null, template: null })}
        onSave={save}
        onDelete={remove}
        onDuplicate={duplicate}
        saving={saving}
        categories={lists.categories}
        brands={lists.brands}
        allProducts={all}
      />
    </div>
  );
}

function StockCellInline({ product, onSave }) {
  const free = available(product);
  return (
    <span className={`font-semibold ${free <= 0 ? 'text-danger' : free <= LOW_STOCK ? 'text-warn' : 'text-ink'}`}>
      <InlineNumber value={Number(product.stock || 0)} onSave={onSave} label="Stock" />
    </span>
  );
}
