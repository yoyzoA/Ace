import axios from 'axios';

const normalizeBaseUrl = (value) => String(value || '').replace(/\/+$/, '');
const DEFAULT_BASE_URL = 'http://localhost:4000';

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_ADMIN_API_BASE_URL || DEFAULT_BASE_URL);

// Sample-data mode for previews and screenshots: no server, no real data.
export const MOCK_MODE = import.meta.env.VITE_ADMIN_MOCK === 'true';

const TOKEN_STORAGE_KEY = 'ace_admin_token';

const storage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set: (value) => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
};

export const getToken = () => (MOCK_MODE ? 'mock' : storage.get());
export const setToken = storage.set;
export const clearToken = storage.clear;

// Called when the server says the session expired, so the app can show the login screen.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const client = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });

client.interceptors.request.use((config) => {
  const token = storage.get();
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
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

let mock = null;
const useMock = async () => {
  if (!mock) mock = await import('./mockApi');
  return mock;
};

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') return "Can't reach the admin server. Check that it's running and you're online.";
  return error?.message || 'Something went wrong.';
};

export const login = async (email, password) => {
  if (MOCK_MODE) return { token: 'mock' };
  const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, { email, password });
  setToken(response.data.token);
  return response.data;
};

const listFrom = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

const cleanSpecs = (specs) =>
  Array.isArray(specs)
    ? specs
        .map((spec) => ({
          label: String(spec?.label || '').trim(),
          value: String(spec?.value || '').trim()
        }))
        .filter((spec) => spec.label || spec.value)
    : [];

const cleanImages = (images) =>
  Array.isArray(images) ? images.map((image) => String(image).trim()).filter(Boolean) : [];

/*
  Builds the request body from only the fields that were given, so a quick
  change (like the Shown/Hidden switch) never blanks out the rest of the product.
*/
const productPayload = (input) => {
  const out = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(input, key);
  ['name', 'category', 'subcategory', 'brand', 'description'].forEach((key) => {
    if (has(key)) out[key] = String(input[key] ?? '').trim();
  });
  if (has('price')) out.price = Number(input.price);
  if (has('stock')) out.stock = Math.max(0, Math.floor(Number(input.stock) || 0));
  if (has('featured')) out.featured = Boolean(input.featured);
  if (has('published')) out.published = Boolean(input.published);
  if (has('images')) out.images = cleanImages(input.images);
  if (has('specs')) out.specs = cleanSpecs(input.specs);
  return out;
};

export const productId = (product) => product?._id || product?.id;

export const getProducts = async () => {
  if (MOCK_MODE) return (await useMock()).getProducts();
  const response = await client.get('/admin/products');
  return listFrom(response.data, 'products');
};

export const createProduct = async (input) => {
  if (MOCK_MODE) return (await useMock()).createProduct(productPayload(input));
  const response = await client.post('/admin/products', productPayload(input));
  return response.data;
};

export const updateProduct = async (id, changes) => {
  if (MOCK_MODE) return (await useMock()).updateProduct(id, productPayload(changes));
  const response = await client.put(`/admin/products/${id}`, productPayload(changes));
  return response.data;
};

export const deleteProduct = async (id) => {
  if (MOCK_MODE) return (await useMock()).deleteProduct(id);
  const response = await client.delete(`/admin/products/${id}`);
  return response.data;
};

// set: { published?, featured?, category?, subcategory?, brand? }
export const bulkUpdateProducts = async (ids, set) => {
  if (MOCK_MODE) return (await useMock()).bulk(ids, 'update', set);
  const response = await client.post('/admin/products/bulk', { ids, action: 'update', set });
  return response.data;
};

export const bulkDeleteProducts = async (ids) => {
  if (MOCK_MODE) return (await useMock()).bulk(ids, 'delete');
  const response = await client.post('/admin/products/bulk', { ids, action: 'delete' });
  return response.data;
};

export const getCategories = async () => {
  if (MOCK_MODE) return [];
  const response = await client.get('/admin/categories');
  return listFrom(response.data, 'categories');
};

export const createCategory = async (name) => {
  if (MOCK_MODE) return { name };
  const response = await client.post('/admin/categories', { name });
  return response.data;
};

export const getBrands = async () => {
  if (MOCK_MODE) return [];
  const response = await client.get('/admin/brands');
  return listFrom(response.data, 'brands');
};

export const createBrand = async (name) => {
  if (MOCK_MODE) return { name };
  const response = await client.post('/admin/brands', { name });
  return response.data;
};

export const getOrders = async () => {
  if (MOCK_MODE) return (await useMock()).getOrders();
  const response = await client.get('/admin/orders');
  return listFrom(response.data, 'orders');
};

export const getOrderById = async (id) => {
  if (MOCK_MODE) return (await useMock()).getOrders().find((order) => order._id === id);
  const response = await client.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  if (MOCK_MODE) return (await useMock()).updateOrderStatus(id, status);
  const response = await client.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

export const getAnalyticsSummary = async () => {
  if (MOCK_MODE) return (await useMock()).getSummary();
  const response = await client.get('/admin/analytics/summary');
  return response.data;
};

/* ---------- Photo uploads ---------- */

export const getUploadStatus = async () => {
  if (MOCK_MODE) return { configured: true };
  const response = await client.get('/admin/uploads/status');
  return response.data;
};

// Uploads photos; the server cleans them up and stores them on the website.
// Returns [{ url, name }]. onProgress gets a number from 0 to 1.
export const uploadImages = async (files, onProgress = () => {}) => {
  if (MOCK_MODE) {
    for (let p = 0.2; p <= 1; p += 0.2) {
      onProgress(p);
      await new Promise((r) => setTimeout(r, 120));
    }
    return [...files].map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
  }
  const form = new FormData();
  [...files].forEach((file) => form.append('photos', file, file.name));
  const response = await client.post('/admin/uploads/images', form, {
    timeout: 120000,
    onUploadProgress: (event) => {
      if (event.total) onProgress(event.loaded / event.total);
    }
  });
  return response.data?.uploaded || [];
};
