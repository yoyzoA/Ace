const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const moneyShort = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const formatMoney = (value, { short = false } = {}) => (short ? moneyShort : money).format(Number(value || 0));

export const formatDate = (value, withTime = true) => {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
};

// "3 hours ago", "yesterday", "12 Nov"
export const timeAgo = (value) => {
  if (!value) return '—';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 172800) return 'yesterday';
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} days ago`;
  return formatDate(value, false);
};

export const orderNumber = (order) => `#${String(order?._id || order?.id || '').slice(-6).toUpperCase()}`;

export const available = (product) => Math.max(0, Number(product?.stock || 0) - Number(product?.reserved || 0));

export const phoneDigits = (value) => String(value || '').replace(/[^\d]/g, '');

// Opens links in the system browser from Electron, or a new tab in a browser.
export const openExternal = (url) => {
  if (window?.adminShell?.openExternal) return window.adminShell.openExternal(url);
  return window.open(url, '_blank', 'noopener');
};
