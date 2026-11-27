import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCopy,
  Clock,
  Download,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  XCircle
} from 'lucide-react';
import { Drawer, EmptyState, ErrorBanner, Skeleton, StatusBadge, Thumb, useConfirm, useToast } from '../components/ui';
import { useData } from '../store';
import { getErrorMessage, productId, updateOrderStatus } from '../api/adminApi';
import { formatDate, formatMoney, openExternal, orderNumber, phoneDigits, timeAgo } from '../lib/format';
import { downloadCsv, today } from '../lib/csv';

const TABS = ['Pending', 'All', 'Completed', 'Cancelled'];
const RANGES = [
  { id: 'any', label: 'Any time', days: null },
  { id: 'today', label: 'Today', days: 1 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 }
];

const paymentLabel = (order) => (order.paymentMethod === 'WHISH' ? 'Whish' : 'Cash on delivery');

const itemCount = (order) => (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
const ageDays = (order) => (Date.now() - new Date(order.createdAt).getTime()) / 86400000;

// Lebanese numbers are often saved without the country code.
const whatsappNumber = (phone) => {
  const digits = phoneDigits(phone);
  if (!digits) return '';
  if (digits.startsWith('961')) return digits;
  return `961${digits.replace(/^0/, '')}`;
};

const orderSummaryText = (order) =>
  [
    `ACE Computers order ${orderNumber(order)}`,
    ...(order.items || []).map((i) => `• ${i.quantity} × ${i.name} — ${formatMoney(i.price * i.quantity)}`),
    `Delivery: ${formatMoney(order.deliveryFee)}`,
    `Total: ${formatMoney(order.total)} (${paymentLabel(order).toLowerCase()})`,
    `Deliver to: ${order.customer?.name || ''}, ${order.customer?.location || ''}`
  ].join('\n');

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

function OrderPanel({ order, onClose, onStatus, busy }) {
  const toast = useToast();
  if (!order) return null;
  const phone = order.customer?.phone;
  const wa = whatsappNumber(phone);
  const greeting = `Hello ${order.customer?.name?.split(' ')[0] || ''}, this is ACE Computers about your order ${orderNumber(order)} (${formatMoney(order.total)}). `;

  return (
    <Drawer
      open
      onClose={onClose}
      busy={Boolean(busy)}
      width="max-w-xl"
      eyebrow={`Placed ${formatDate(order.createdAt)}`}
      title={`Order ${orderNumber(order)}`}
      footer={
        order.status === 'Pending' ? (
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-secondary text-danger" onClick={() => onStatus(order, 'Cancelled')} disabled={Boolean(busy)}>
              <XCircle className="h-4 w-4" />
              {busy === 'Cancelled' ? 'Cancelling…' : 'Cancel order'}
            </button>
            <button type="button" className="btn-primary bg-success hover:bg-success/90" onClick={() => onStatus(order, 'Completed')} disabled={Boolean(busy)}>
              <CheckCircle2 className="h-4 w-4" />
              {busy === 'Completed' ? 'Saving…' : 'Mark as delivered'}
            </button>
          </div>
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          {order.status === 'Pending' && ageDays(order) >= 2 ? (
            <span className="chip bg-warnSoft text-warn">
              <Clock className="h-3 w-3" /> Waiting {Math.floor(ageDays(order))} days
            </span>
          ) : null}
          {order.status === 'Completed' && order.completedAt ? (
            <span className="text-xs text-muted">Delivered {formatDate(order.completedAt)}</span>
          ) : null}
        </div>

        {/* Customer */}
        <section className="rounded-xl border border-line p-4">
          <p className="eyebrow">Customer</p>
          <p className="mt-1.5 font-display text-lg font-semibold text-ink">{order.customer?.name || 'Guest'}</p>
          <div className="mt-2 space-y-1 text-sm text-muted">
            {phone ? (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="select-all text-ink">{phone}</span>
              </p>
            ) : null}
            {order.customer?.location ? (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="select-all">{order.customer.location}</span>
              </p>
            ) : null}
          </div>
          {phone ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-primary bg-[#1f9d55] py-1.5 hover:bg-[#1f9d55]/90" onClick={() => openExternal(`https://wa.me/${wa}?text=${encodeURIComponent(greeting)}`)}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </button>
              <button type="button" className="btn-secondary py-1.5" onClick={() => openExternal(`tel:${phoneDigits(phone)}`)}>
                <Phone className="h-4 w-4" /> Call
              </button>
              <button type="button" className="btn-ghost py-1.5" onClick={async () => toast((await copy(phone)) ? 'Phone number copied.' : { tone: 'error', message: "Couldn't copy. Select the number instead." })}>
                <ClipboardCopy className="h-4 w-4" /> Copy number
              </button>
            </div>
          ) : null}
        </section>

        {/* Items */}
        <section className="rounded-xl border border-line">
          <div className="flex items-center justify-between px-4 pt-4">
            <p className="eyebrow">
              {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'}
            </p>
            <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={async () => toast((await copy(orderSummaryText(order))) ? 'Order summary copied. Paste it into WhatsApp.' : { tone: 'error', message: "Couldn't copy the summary." })}>
              <ClipboardCopy className="h-3.5 w-3.5" /> Copy summary
            </button>
          </div>
          <ul className="divide-y divide-line">
            {(order.items || []).map((item) => (
              <li key={`${item.productId}-${item.name}`} className="flex items-center gap-3 px-4 py-3">
                <Thumb src={item.image} size="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.quantity} × {formatMoney(item.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular text-ink">{formatMoney(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-line bg-sunken/50 px-4 py-3 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular">{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Delivery</dt>
              <dd className="tabular">{formatMoney(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold text-ink">
              <dt>Total</dt>
              <dd className="tabular">{formatMoney(order.total)}</dd>
            </div>
            <p className="pt-1 text-xs text-muted">Payment: <span className="font-semibold text-ink">{paymentLabel(order)}</span></p>
          </dl>
        </section>

        {order.status === 'Pending' ? (
          <p className="text-xs text-muted">
            Marking as delivered takes the items out of stock. Cancelling releases the items held for this order.
          </p>
        ) : null}
      </div>
    </Drawer>
  );
}

export default function Orders({ intent, clearIntent }) {
  const { orders, loadOrders, replaceOrder, loadProducts, loadSummary, products } = useData();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('Pending');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('any');
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState('');

  const all = orders.data || [];

  useEffect(() => {
    if (!orders.data && !orders.loading) loadOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start on "All" when nothing is waiting.
  useEffect(() => {
    if (orders.data && !orders.data.some((o) => o.status === 'Pending')) setTab((t) => (t === 'Pending' ? 'All' : t));
  }, [orders.data]);

  useEffect(() => {
    if (intent?.open) {
      setOpenId(intent.open);
      clearIntent();
    }
  }, [intent]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(
    () => ({
      All: all.length,
      Pending: all.filter((o) => o.status === 'Pending').length,
      Completed: all.filter((o) => o.status === 'Completed').length,
      Cancelled: all.filter((o) => o.status === 'Cancelled').length
    }),
    [all]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace('#', '');
    const days = RANGES.find((r) => r.id === range)?.days;
    const since = days ? (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (days - 1));
      return d;
    })() : null;
    return all.filter((o) => {
      if (tab !== 'All' && o.status !== tab) return false;
      if (since && new Date(o.createdAt) < since) return false;
      if (!q) return true;
      const text = [orderNumber(o), o.customer?.name, o.customer?.phone, o.customer?.location, ...(o.items || []).map((i) => i.name)]
        .join(' ')
        .toLowerCase()
        .replace('#', '');
      return text.includes(q) || phoneDigits(o.customer?.phone).includes(phoneDigits(q) || '\u0000');
    });
  }, [all, tab, query, range]);

  const openOrder = all.find((o) => productId(o) === openId) || null;

  const changeStatus = async (order, status) => {
    if (status === 'Cancelled') {
      const ok = await confirm({
        title: `Cancel order ${orderNumber(order)}?`,
        message: 'The items held for this order go back on sale. This can’t be undone.',
        confirmLabel: 'Cancel order',
        danger: true
      });
      if (!ok) return;
    }
    setBusy(status);
    try {
      const updated = await updateOrderStatus(productId(order), status);
      replaceOrder(updated);
      toast(status === 'Completed' ? `Order ${orderNumber(order)} marked as delivered.` : `Order ${orderNumber(order)} cancelled.`);
      // Stock and sales figures changed: refresh them in the background.
      if (products.data) loadProducts();
      loadSummary();
    } catch (error) {
      toast({ tone: 'error', message: getErrorMessage(error) });
    } finally {
      setBusy('');
    }
  };

  const exportCsv = () => {
    downloadCsv(`ace-orders-${today()}.csv`, [
      { label: 'Order', value: (o) => orderNumber(o) },
      { label: 'Placed', value: (o) => new Date(o.createdAt).toLocaleString('en-GB') },
      { label: 'Status', value: (o) => o.status },
      { label: 'Customer', value: (o) => o.customer?.name },
      { label: 'Phone', value: (o) => o.customer?.phone },
      { label: 'Location', value: (o) => o.customer?.location },
      { label: 'Items', value: (o) => (o.items || []).map((i) => `${i.quantity} x ${i.name}`).join('; ') },
      { label: 'Subtotal', value: (o) => o.subtotal },
      { label: 'Delivery', value: (o) => o.deliveryFee },
      { label: 'Total', value: (o) => o.total },
      { label: 'Payment', value: (o) => paymentLabel(o) },
      { label: 'Delivered', value: (o) => (o.completedAt ? new Date(o.completedAt).toLocaleString('en-GB') : '') }
    ], filtered);
    toast(`Exported ${filtered.length} orders.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Sales</p>
          <h1 className="page-title">Orders</h1>
          {orders.data ? (
            <p className="mt-1 text-sm text-muted">
              {counts.Pending ? `${counts.Pending} waiting to be delivered` : 'Nothing waiting right now'}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={loadOrders} disabled={orders.loading}>
            <RefreshCw className={`h-4 w-4 ${orders.loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button type="button" className="btn-secondary" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="scroll-thin -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-xl border border-line bg-panel p-1" role="tablist" aria-label="Order status">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? 'bg-accent text-white' : 'text-muted hover:bg-sunken hover:text-ink'
              }`}
            >
              {t}
              <span className={`tabular text-xs ${tab === t ? 'text-white/80' : 'text-muted/80'}`}>{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input type="search" className="field pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order number, customer, phone or product" aria-label="Search orders" />
        </div>
        <select className="field" value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <ErrorBanner message={orders.error} onRetry={loadOrders} />

      {orders.loading && !orders.data ? (
        <div className="card divide-y divide-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : orders.data && !filtered.length ? (
        <EmptyState
          icon={ShoppingBag}
          title={all.length ? 'No orders here' : 'No orders yet'}
          message={all.length ? 'Try another tab, search or date range.' : 'Orders placed on the website show up here.'}
        />
      ) : orders.data ? (
        <>
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full table-fixed text-sm">
              <thead className="border-b border-line bg-sunken/60 text-left text-xs font-semibold text-muted">
                <tr>
                  <th className="w-32 px-4 py-3">Order</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="w-44 px-3 py-3">Items</th>
                  <th className="w-28 px-3 py-3 text-right">Total</th>
                  <th className="w-40 px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((o) => (
                  <tr key={productId(o)} onClick={() => setOpenId(productId(o))} className="cursor-pointer transition-colors hover:bg-sunken/50">
                    <td className="px-4 py-3">
                      <button type="button" className="font-semibold text-ink hover:text-accent" onClick={() => setOpenId(productId(o))}>
                        {orderNumber(o)}
                      </button>
                      <p className="text-xs text-muted" title={formatDate(o.createdAt)}>
                        {timeAgo(o.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="truncate font-medium text-ink">{o.customer?.name || 'Guest'}</p>
                      <p className="truncate text-xs text-muted">{o.customer?.location}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {(o.items || []).slice(0, 3).map((i) => (
                            <Thumb key={`${i.productId}-${i.name}`} src={i.image} size="h-8 w-8" />
                          ))}
                        </div>
                        <span className="whitespace-nowrap text-xs text-muted">{itemCount(o)} item{itemCount(o) === 1 ? '' : 's'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular text-ink">{formatMoney(o.total)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={o.status} />
                        {o.paymentMethod === 'WHISH' ? <span className="chip bg-accentSoft text-accent">Whish</span> : null}
                        {o.status === 'Pending' && ageDays(o) >= 2 ? (
                          <span className="chip bg-warnSoft text-warn" title="Waiting for more than 2 days">
                            <Clock className="h-3 w-3" /> {Math.floor(ageDays(o))}d
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {filtered.map((o) => (
              <li key={productId(o)}>
                <button type="button" onClick={() => setOpenId(productId(o))} className="card flex w-full items-start gap-3 p-3 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{orderNumber(o)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-ink">{o.customer?.name || 'Guest'}</p>
                    <p className="truncate text-xs text-muted">
                      {timeAgo(o.createdAt)} · {itemCount(o)} item{itemCount(o) === 1 ? '' : 's'} · {o.customer?.location}
                    </p>
                  </div>
                  <span className="font-semibold tabular text-ink">{formatMoney(o.total)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <OrderPanel order={openOrder} onClose={() => setOpenId(null)} onStatus={changeStatus} busy={busy} />
    </div>
  );
}
