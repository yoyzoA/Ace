import axios from 'axios';

const normalizeBaseUrl = (value) => String(value || '').replace(/\/+$/, '');
const DEFAULT_BASE_URL = 'http://localhost:4000';

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_ADMIN_API_BASE_URL || DEFAULT_BASE_URL
);

if (!import.meta.env.VITE_ADMIN_API_BASE_URL) {
  console.warn(`VITE_ADMIN_API_BASE_URL is not set. Using ${DEFAULT_BASE_URL}.`);
}

const TOKEN_STORAGE_KEY = 'ace_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
    email,
    password
  });
  setToken(response.data.token);
  return response.data;
};

const normalizeListResponse = (data, key) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data[key])) {
    return data[key];
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
};

const normalizeSpecs = (specs) =>
  Array.isArray(specs)
    ? specs
        .map((spec) => ({
          label: (spec?.label || '').toString().trim(),
          value: (spec?.value || '').toString().trim()
        }))
        .filter((spec) => spec.label || spec.value)
    : [];

const normalizeImages = (images) =>
  Array.isArray(images) ? images.map((image) => String(image).trim()).filter(Boolean) : [];

const normalizeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeStock = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0;
  }
  return numberValue;
};

const normalizeProductPayload = (payload) => ({
  name: (payload.name || '').trim(),
  price: normalizeNumber(payload.price),
  category: (payload.category || '').trim(),
  brand: (payload.brand || '').trim(),
  description: (payload.description || '').trim(),
  featured: Boolean(payload.featured),
  stock: normalizeStock(payload.stock),
  images: normalizeImages(payload.images),
  specs: normalizeSpecs(payload.specs)
});

export const getProducts = async () => {
  const response = await client.get('/admin/products');

  return normalizeListResponse(response.data, 'products');
};

export const createProduct = async (payload) => {
  const response = await client.post('/admin/products', normalizeProductPayload(payload));

  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await client.put(
    `/admin/products/${id}`,
    normalizeProductPayload(payload)
  );

  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await client.delete(`/admin/products/${id}`);

  return response.data;
};

export const getCategories = async () => {
  const response = await client.get('/admin/categories');

  return normalizeListResponse(response.data, 'categories');
};

export const createCategory = async (name) => {
  const response = await client.post('/admin/categories', { name });

  return response.data;
};

export const getBrands = async () => {
  const response = await client.get('/admin/brands');

  return normalizeListResponse(response.data, 'brands');
};

export const createBrand = async (name) => {
  const response = await client.post('/admin/brands', { name });

  return response.data;
};

export const getOrders = async () => {
  const response = await client.get('/admin/orders');

  return normalizeListResponse(response.data, 'orders');
};

export const getOrderById = async (id) => {
  const response = await client.get(`/admin/orders/${id}`);

  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await client.patch(`/admin/orders/${id}/status`, { status });

  return response.data;
};

export const getAnalyticsSummary = async () => {
  const response = await client.get('/admin/analytics/summary');

  return response.data;
};
