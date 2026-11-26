import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  EyeOff,
  ImageOff,
  PackageX,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { ErrorBanner, Skeleton, StatusBadge, Thumb } from '../components/ui';
import { useData } from '../store';
import { productId } from '../api/adminApi';
import { formatMoney, orderNumber, timeAgo } from '../lib/format';

function Kpi({ label, value, note, tone = 'text-ink', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card p-4 text-left sm:p-5 ${onClick ? 'transition-colors hover:border-accent/40' : ''}`}
    >
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold tabular sm:text-[1.7rem] ${tone}`}>{value}</p>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </Tag>
  );
}

/* Bar chart of daily revenue, drawn to one scale with labelled gridlines. */
function RevenueChart({ days }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...days.map((d) => d.revenue), 0);
  const step = max <= 100 ? 25 : max <= 500 ? 100 : max <= 2000 ? 500 : 1000;
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step);
  const W = 640;
  const H = 200;
  const left = 44;
  const bottom = 22;
  const plotW = W - left - 8;
  const plotH = H - bottom - 8;
  const slot = plotW / days.length;
  const barW = Math.max(3, Math.min(28, slot * 0.6));
  const y = (v) => 8 + plotH - (v / top) * plotH;
  const labelEvery = days.length > 14 ? 5 : 1;
  const shown = hover !== null ? days[hover] : null;

  return (
    <div className="relative">
      <div className="mb-2 h-5 text-xs text-muted" aria-live="polite">
        {shown ? (
          <span>
            <span className="font-semibold text-ink">{formatMoney(shown.revenue)}</span> on{' '}
            {new Date(shown.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        ) : (
          'Point at a bar to see the day.'
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue by day from delivered orders">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - 8} y1={y(t)} y2={y(t)} stroke="rgb(var(--line))" strokeDasharray={t ? '3 4' : undefined} />
            <text x={left - 8} y={y(t)} dy="0.35em" textAnchor="end" fontSize="10" fill="rgb(var(--muted))">
              {t >= 1000 ? `$${t / 1000}k` : `$${t}`}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = left + i * slot + (slot - barW) / 2;
          const h = Math.max(d.revenue ? 2 : 0, 8 + plotH - y(d.revenue));
          const isLast = i === days.length - 1;
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={left + i * slot} y={8} width={slot} height={plotH} fill="transparent" />
              <rect
                x={x}
                y={8 + plotH - h}
                width={barW}
                height={h}
                rx={Math.min(4, barW / 2)}
                fill={hover === i || (hover === null && isLast) ? 'rgb(var(--accent))' : 'rgb(var(--brand) / 0.55)'}
              />
              {i % labelEvery === 0 || isLast ? (
                <text x={left + i * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">
                  {new Date(d.date).toLocaleDateString('en-GB', days.length > 7 ? { day: 'numeric', month: 'short' } : { weekday: 'short' })}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HealthTile({ icon: Icon, label, value, note, tone, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-accent/40 hover:bg-sunken/50">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold leading-tight tabular text-ink">{value}</span>
        <span className="block truncate text-xs text-muted">{label}</span>
      </span>
      {note ? <span className="hidden text-xs text-muted xl:inline">{note}</span> : null}
      <ArrowRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
    </button>
  );
}

export default function Dashboard({ navigate }) {
  const { summary, orders, loadSummary, loadOrders } = useData();
  const [range, setRange] = useState(30);

  useEffect(() => {
    loadSummary();
    if (!orders.data && !orders.loading) loadOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const s = summary.data;
  const days = range === 7 ? s?.revenueByDay?.last7 || [] : s?.revenueByDay?.last30 || [];
  const rangeTotal = days.reduce((sum, d) => sum + d.revenue, 0);
  const waiting = useMemo(
    () => (orders.data || []).filter((o) => o.status === 'Pending').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [orders.data]
  );
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="page-title">{greeting}</h1>
        </div>
        <button type="button" className="btn-secondary" onClick={() => { loadSummary(); loadOrders(); }} disabled={summary.loading}>
          <RefreshCw className={`h-4 w-4 ${summary.loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <ErrorBanner message={summary.error} onRetry={loadSummary} />

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {s ? (
          <>
            <Kpi label="Sales, last 30 days" value={formatMoney(s.revenueLast30 ?? 0, { short: true })} note={`${formatMoney(s.totalRevenue, { short: true })} all time`} />
            <Kpi
              label="Orders waiting"
              value={s.pendingOrders}
              tone={s.pendingOrders ? 'text-warn' : 'text-ink'}
              note={s.pendingOrders ? `${formatMoney(s.pendingValue ?? 0, { short: true })} to collect` : 'All delivered'}
              onClick={() => navigate('orders')}
            />
            <Kpi label="Average order" value={formatMoney(s.averageOrderValue ?? 0, { short: true })} note={`${s.completedOrders} delivered · ${s.cancelledOrders} cancelled`} />
            <Kpi
              label="On the website"
              value={s.catalog?.shown ?? '—'}
              note={s.catalog ? `${s.catalog.hidden} hidden · ${s.catalog.featured} featured` : ''}
              onClick={() => navigate('products', { view: 'shown' })}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Revenue */}
        <section className="card p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">Sales</h2>
              <p className="text-xs text-muted">
                Delivered orders · <span className="font-semibold text-ink">{formatMoney(rangeTotal)}</span> in the last {range} days
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-line p-0.5 text-xs font-semibold">
              {[7, 30].map((r) => (
                <button key={r} type="button" onClick={() => setRange(r)} className={`rounded-md px-2.5 py-1 ${range === r ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`} aria-pressed={range === r}>
                  {r} days
                </button>
              ))}
            </div>
          </div>
          {s ? <RevenueChart days={days} /> : <Skeleton className="h-52" />}
        </section>

        {/* Waiting orders */}
        <section className="card flex flex-col p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Waiting to be delivered</h2>
            <button type="button" className="text-xs font-semibold text-accent hover:underline" onClick={() => navigate('orders')}>
              All orders
            </button>
          </div>
          {orders.data ? (
            waiting.length ? (
              <ul className="-mx-2 space-y-0.5">
                {waiting.slice(0, 6).map((o) => (
                  <li key={productId(o)}>
                    <button type="button" onClick={() => navigate('orders', { open: productId(o) })} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-sunken">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {orderNumber(o)} · {o.customer?.name || 'Guest'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="h-3 w-3" aria-hidden="true" /> {timeAgo(o.createdAt)} · {o.customer?.location}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular text-ink">{formatMoney(o.total)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                <StatusBadge status="Completed" />
                <p className="text-sm text-muted">No orders waiting. Nice work.</p>
              </div>
            )
          ) : (
            <Skeleton className="h-40" />
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Best sellers */}
        <section className="card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="font-display text-base font-semibold text-ink">Best sellers, last 30 days</h2>
          </div>
          {s ? (
            s.topProducts?.length ? (
              <ol className="space-y-2.5">
                {s.topProducts.map((p, i) => {
                  const most = s.topProducts[0].quantity || 1;
                  return (
                    <li key={p._id || p.name}>
                      <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => p._id && navigate('products', { edit: String(p._id) })}>
                        <span className="w-4 text-xs font-semibold tabular text-muted">{i + 1}</span>
                        <Thumb src={p.image} size="h-9 w-9" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-sunken">
                            <span className="block h-full rounded-full bg-brand" style={{ width: `${(p.quantity / most) * 100}%` }} />
                          </span>
                        </span>
                        <span className="text-right text-xs text-muted">
                          <span className="block font-semibold tabular text-ink">{p.quantity} sold</span>
                          {formatMoney(p.revenue, { short: true })}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="py-6 text-center text-sm text-muted">No delivered orders in the last 30 days yet.</p>
            )
          ) : (
            <Skeleton className="h-48" />
          )}
        </section>

        {/* Catalog health */}
        <section className="card p-4 sm:p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Catalog check</h2>
          {s?.catalog ? (
            <div className="space-y-2">
              <HealthTile icon={PackageX} label="On the website but out of stock" value={s.catalog.outOfStock} tone="bg-dangerSoft text-danger" onClick={() => navigate('products', { view: 'out' })} />
              <HealthTile icon={AlertTriangle} label="Running low (1–2 left)" value={s.catalog.lowStock?.length >= 8 ? '8+' : s.catalog.lowStock?.length || 0} tone="bg-warnSoft text-warn" onClick={() => navigate('products', { view: 'low' })} />
              <HealthTile icon={ImageOff} label="On the website without a photo" value={s.catalog.noPhoto} tone="bg-accentSoft text-accent" onClick={() => navigate('products', { view: 'noPhoto' })} />
              <HealthTile icon={EyeOff} label="Hidden from the website" value={s.catalog.hidden} tone="bg-sunken text-muted" onClick={() => navigate('products', { view: 'hidden' })} />
            </div>
          ) : (
            <Skeleton className="h-48" />
          )}
        </section>

        {/* Low stock */}
        <section className="card p-4 sm:p-5 lg:col-span-2 xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Restock soon</h2>
            <button type="button" className="text-xs font-semibold text-accent hover:underline" onClick={() => navigate('products', { view: 'low' })}>
              See all
            </button>
          </div>
          {s?.catalog ? (
            s.catalog.lowStock?.length ? (
              <ul className="-mx-2 space-y-0.5">
                {s.catalog.lowStock.map((p) => (
                  <li key={p._id}>
                    <button type="button" onClick={() => navigate('products', { edit: String(p._id) })} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-sunken">
                      <Thumb src={p.images?.[0]} size="h-9 w-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                        <span className="block truncate text-xs text-muted">
                          {p.category} · {formatMoney(p.price)}
                        </span>
                      </span>
                      <span className="chip bg-warnSoft text-warn">{p.available} left</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted">Nothing is running low.</p>
            )
          ) : (
            <Skeleton className="h-48" />
          )}
        </section>
      </div>
    </div>
  );
}
