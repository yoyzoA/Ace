// In-memory sample data, used only when VITE_ADMIN_MOCK=true (previews and
// screenshots). Nothing here touches the real database.
import sample from './mockData.json';

const clone = (value) => JSON.parse(JSON.stringify(value));
const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let products = clone(sample.products);
let orders = clone(sample.orders);

export const getProducts = async () => {
  await wait();
  return clone(products);
};

export const createProduct = async (payload) => {
  await wait();
  const product = {
    _id: Math.random().toString(16).slice(2).padEnd(24, '0'),
    reserved: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload
  };
  products = [product, ...products];
  return clone(product);
};

export const updateProduct = async (id, changes) => {
  await wait(150);
  products = products.map((p) => (p._id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p));
  return clone(products.find((p) => p._id === id));
};

export const deleteProduct = async (id) => {
  await wait();
  products = products.filter((p) => p._id !== id);
  return { message: 'Product deleted.' };
};

export const bulk = async (ids, action, set = {}) => {
  await wait();
  const pick = new Set(ids);
  if (action === 'delete') {
    products = products.filter((p) => !pick.has(p._id));
  } else {
    products = products.map((p) => (pick.has(p._id) ? { ...p, ...set } : p));
  }
  return { matched: ids.length, modified: ids.length };
};

export const getOrders = () => clone(orders);

export const updateOrderStatus = async (id, status) => {
  await wait();
  orders = orders.map((o) =>
    o._id === id ? { ...o, status, completedAt: status === 'Completed' ? new Date().toISOString() : null } : o
  );
  return clone(orders.find((o) => o._id === id));
};

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

export const getSummary = async () => {
  await wait();
  const completed = orders.filter((o) => o.status === 'Completed');
  const days = (n) => {
    const out = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      out.push({
        date: key,
        revenue: completed.filter((o) => dayKey(o.completedAt) === key).reduce((s, o) => s + o.total, 0)
      });
    }
    return out;
  };
  const last30 = days(30);
  const totalRevenue = completed.reduce((s, o) => s + o.total, 0);
  const tally = new Map();
  completed.forEach((o) =>
    o.items.forEach((item) => {
      const row = tally.get(item.productId) || { _id: item.productId, name: item.name, image: item.image, quantity: 0, revenue: 0 };
      row.quantity += item.quantity;
      row.revenue += item.price * item.quantity;
      tally.set(item.productId, row);
    })
  );
  const shown = products.filter((p) => p.published !== false);
  const available = (p) => (p.stock || 0) - (p.reserved || 0);
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'Pending').length,
    completedOrders: completed.length,
    cancelledOrders: orders.filter((o) => o.status === 'Cancelled').length,
    totalRevenue,
    revenueLast30: last30.reduce((s, d) => s + d.revenue, 0),
    averageOrderValue: completed.length ? totalRevenue / completed.length : 0,
    pendingValue: orders.filter((o) => o.status === 'Pending').reduce((s, o) => s + o.total, 0),
    revenueByDay: { last7: last30.slice(-7), last30 },
    topProducts: [...tally.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 6),
    catalog: {
      total: products.length,
      shown: shown.length,
      hidden: products.length - shown.length,
      featured: shown.filter((p) => p.featured).length,
      noPhoto: shown.filter((p) => !(p.images || []).length).length,
      outOfStock: shown.filter((p) => available(p) <= 0).length,
      lowStock: shown
        .filter((p) => available(p) >= 1 && available(p) <= 2)
        .slice(0, 8)
        .map((p) => ({ _id: p._id, name: p.name, images: (p.images || []).slice(0, 1), available: available(p), price: p.price, category: p.category }))
    }
  };
};
