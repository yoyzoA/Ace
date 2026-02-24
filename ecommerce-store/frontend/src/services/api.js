import { mockProducts } from '../data/mockProducts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK_DATA = (import.meta.env.VITE_USE_MOCK_DATA || 'true') === 'true';

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set');
  }
};

const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id
});

const normalizeProducts = (products) => products.map(normalizeProduct);

const buildQueryString = (params) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      return;
    }

    search.set(key, value);
  });

  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

export const getProducts = async (params = {}) => {
  if (USE_MOCK_DATA) {
    return normalizeProducts(mockProducts);
  }

  assertApiBaseUrl();
  const payload = await fetchJson(
    `${API_BASE_URL}/api/products${buildQueryString(params)}`
  );
  return normalizeProducts(payload.data || []);
};

export const getProductById = async (id) => {
  if (USE_MOCK_DATA) {
    const product = mockProducts.find(
      (item) => item._id === id || item.id === id
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return normalizeProduct(product);
  }

  assertApiBaseUrl();
  const payload = await fetchJson(`${API_BASE_URL}/api/products/${id}`);
  return normalizeProduct(payload.data);
};

export const placeOrder = async (payload) => {
  if (USE_MOCK_DATA) {
    throw new Error('Checkout requires the API backend.');
  }

  assertApiBaseUrl();
  return fetchJson(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};
