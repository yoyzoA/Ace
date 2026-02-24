import { useEffect, useMemo, useState } from 'react';
import { getAnalyticsSummary } from '../api/adminApi';

const formatCurrency = (value) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numberValue);
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(7);

  const refreshData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch (fetchError) {
      setError(fetchError?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const revenueSeries = useMemo(() => {
    if (!summary?.revenueByDay) {
      return [];
    }
    return range === 30 ? summary.revenueByDay.last30 || [] : summary.revenueByDay.last7 || [];
  }, [summary, range]);

  const maxRevenue = useMemo(() => {
    if (!revenueSeries.length) {
      return 0;
    }
    return Math.max(...revenueSeries.map((entry) => entry.revenue || 0), 0);
  }, [revenueSeries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Performance
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRange(7)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              range === 7
                ? 'border-accent bg-accent text-white'
                : 'border-outline text-ink'
            }`}
          >
            7 days
          </button>
          <button
            type="button"
            onClick={() => setRange(30)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              range === 30
                ? 'border-accent bg-accent text-white'
                : 'border-outline text-ink'
            }`}
          >
            30 days
          </button>
          <button
            type="button"
            onClick={refreshData}
            className="rounded-full border border-outline px-4 py-2 text-xs font-semibold text-ink"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/40 bg-[rgba(186,67,67,0.08)] px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-outline bg-panel px-6 py-10 text-center text-sm text-muted">
          Loading analytics...
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-outline bg-panel p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Total orders
              </p>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {summary.totalOrders || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-outline bg-panel p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Pending orders
              </p>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {summary.pendingOrders || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-outline bg-panel p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Completed orders
              </p>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {summary.completedOrders || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-outline bg-panel p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Cancelled orders
              </p>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {summary.cancelledOrders || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-outline bg-panel p-4 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Total revenue
              </p>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {formatCurrency(summary.totalRevenue || 0)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-outline bg-panel p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Revenue by day</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Last {range} days
              </span>
            </div>
            {revenueSeries.length ? (
              <div className="mt-4 space-y-2 text-xs text-muted">
                {revenueSeries.map((entry) => {
                  const width = maxRevenue ? (entry.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={entry.date} className="flex items-center gap-3">
                      <span className="w-20">{entry.date}</span>
                      <div className="h-2 flex-1 rounded-full bg-outline/50">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-ink">
                        {formatCurrency(entry.revenue || 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 text-sm text-muted">No revenue data yet.</div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
