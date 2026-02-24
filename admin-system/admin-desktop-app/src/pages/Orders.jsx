import { useEffect, useMemo, useState } from 'react';
import {
  getOrderById,
  getOrders,
  updateOrderStatus
} from '../api/adminApi';

const formatCurrency = (value) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numberValue);
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleString('en-US') : '--';

const statusStyles = {
  Pending: 'border-highlight/40 bg-[rgba(222,132,55,0.12)] text-highlight',
  Completed: 'border-success/40 bg-[rgba(14,122,96,0.12)] text-success',
  Cancelled: 'border-danger/40 bg-[rgba(186,67,67,0.12)] text-danger'
};

const sanitizePhone = (value) => String(value || '').replace(/[^\d]/g, '');

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState('');

  const refreshData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (fetchError) {
      setError(fetchError?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleView = async (orderId) => {
    const fallbackOrder = orders.find(
      (order) => (order._id || order.id) === orderId
    );
    if (fallbackOrder) {
      setSelectedOrder(fallbackOrder);
    }
    setDetailLoading(true);
    setDetailError('');
    try {
      const data = await getOrderById(orderId);
      setSelectedOrder(data);
    } catch (fetchError) {
      setDetailError(fetchError?.message || 'Failed to load order.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOrder(null);
    setDetailError('');
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!selectedOrder || statusUpdating) {
      return;
    }

    setStatusUpdating(nextStatus);
    setDetailError('');

    try {
      const updated = await updateOrderStatus(
        selectedOrder._id || selectedOrder.id,
        nextStatus
      );
      setSelectedOrder(updated);
      await refreshData();
    } catch (updateError) {
      setDetailError(updateError?.message || 'Failed to update order.');
    } finally {
      setStatusUpdating('');
    }
  };

  const orderStats = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'Pending').length;
    const completed = orders.filter((order) => order.status === 'Completed').length;
    const cancelled = orders.filter((order) => order.status === 'Cancelled').length;
    return { pending, completed, cancelled, total: orders.length };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Fulfillment
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Orders</h1>
        </div>
        <button
          type="button"
          onClick={refreshData}
          className="rounded-full border border-outline px-4 py-2 text-sm font-semibold text-ink"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: orderStats.total },
          { label: 'Pending', value: orderStats.pending },
          { label: 'Completed', value: orderStats.completed },
          { label: 'Cancelled', value: orderStats.cancelled }
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-outline bg-panel p-4 shadow-panel"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {stat.label}
            </p>
            <div className="mt-3 text-2xl font-semibold text-ink">{stat.value}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/40 bg-[rgba(186,67,67,0.08)] px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-outline bg-panel px-6 py-10 text-center text-sm text-muted">
          Loading orders...
        </div>
      ) : orders.length ? (
        <div className="space-y-3">
          <div className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_0.4fr_0.6fr_0.6fr_0.6fr] gap-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <div>Order</div>
            <div>Customer</div>
            <div>Items</div>
            <div>Total</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {orders.map((order) => {
            const id = order._id || order.id;
            const statusClass =
              statusStyles[order.status] || 'border-outline text-ink';
            return (
              <div
                key={id}
                className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_0.4fr_0.6fr_0.6fr_0.6fr] items-center gap-4 rounded-2xl border border-outline bg-panel px-4 py-3 shadow-panel"
              >
                <div>
                  <div className="text-sm font-semibold text-ink">
                    #{String(id).slice(-6)}
                  </div>
                  <div className="text-xs text-muted">{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {order.customer?.name || 'Guest'}
                  </div>
                  <div className="text-xs text-muted">{order.customer?.phone}</div>
                </div>
                <div className="text-sm text-ink">
                  {order.items?.length || 0}
                </div>
                <div className="text-sm font-semibold text-ink">
                  {formatCurrency(order.total)}
                </div>
                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleView(id)}
                    className="rounded-full border border-outline px-3 py-1 text-xs font-semibold text-ink transition hover:border-accent"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-outline bg-panel px-6 py-10 text-center text-sm text-muted">
          No orders yet.
        </div>
      )}

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(15,23,42,0.45)]"
            onClick={handleClose}
            aria-label="Close"
          />
          <div className="relative ml-auto h-full w-full max-w-xl overflow-y-auto bg-panel p-6 shadow-pop">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Order details
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">
                  #{String(selectedOrder._id || selectedOrder.id).slice(-6)}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Placed {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-outline px-3 py-1 text-xs font-semibold text-ink"
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <div className="mt-6 text-sm text-muted">Loading order details...</div>
            ) : null}

            {detailError ? (
              <div className="mt-4 rounded-2xl border border-danger/40 bg-[rgba(186,67,67,0.08)] px-4 py-3 text-sm text-danger">
                {detailError}
              </div>
            ) : null}

            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl border border-outline bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Customer
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {selectedOrder.customer?.name || 'Guest'}
                </p>
                <p className="text-sm text-muted">{selectedOrder.customer?.location}</p>
                {selectedOrder.customer?.phone ? (
                  <button
                    type="button"
                    onClick={() => {
                      const sanitized = sanitizePhone(selectedOrder.customer?.phone);
                      if (!sanitized) {
                        return;
                      }
                      const url = `https://wa.me/${sanitized}`;
                      if (window?.adminShell?.openExternal) {
                        window.adminShell.openExternal(url);
                      }
                    }}
                    className="mt-3 text-sm font-semibold text-accent"
                  >
                    {selectedOrder.customer?.phone}
                  </button>
                ) : null}
              </div>

              <div className="rounded-2xl border border-outline bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Items
                </p>
                <div className="mt-3 space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={`${item.productId}-${item.name}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.name}</p>
                        <p className="text-xs text-muted">
                          {item.brand} · {item.category}
                        </p>
                        <p className="text-xs text-muted">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-semibold text-ink">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-outline bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Summary
                </p>
                <div className="mt-3 space-y-2 text-sm text-muted">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="text-ink">
                      {formatCurrency(selectedOrder.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span className="text-ink">
                      {formatCurrency(selectedOrder.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-ink">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="text-xs text-muted">
                    Payment: {selectedOrder.paymentMethod || 'COD'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    statusStyles[selectedOrder.status] || 'border-outline text-ink'
                  }`}
                >
                  {selectedOrder.status}
                </span>
                {selectedOrder.status === 'Pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('Completed')}
                      disabled={statusUpdating === 'Completed'}
                      className="rounded-full border border-success/40 px-4 py-2 text-xs font-semibold text-success"
                    >
                      {statusUpdating === 'Completed' ? 'Updating...' : 'Mark completed'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('Cancelled')}
                      disabled={statusUpdating === 'Cancelled'}
                      className="rounded-full border border-danger/40 px-4 py-2 text-xs font-semibold text-danger"
                    >
                      {statusUpdating === 'Cancelled' ? 'Updating...' : 'Cancel order'}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
