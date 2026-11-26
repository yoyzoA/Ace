import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  getAnalyticsSummary,
  getBrands,
  getCategories,
  getErrorMessage,
  getOrders,
  getProducts,
  productId
} from './api/adminApi';

/*
  Shared data for every page and the quick search: products, orders and the
  dashboard summary. Each list loads on first use and can be refreshed.
*/
const DataContext = createContext(null);

const namesFrom = (items, extra) => {
  const map = new Map();
  [...items.map((i) => i?.name || i), ...extra].forEach((value) => {
    const name = String(value || '').trim();
    if (name && !map.has(name.toLowerCase())) map.set(name.toLowerCase(), name);
  });
  return [...map.values()].sort((a, b) => a.localeCompare(b));
};

const initial = { data: null, loading: false, error: '' };

export function DataProvider({ children }) {
  const [products, setProducts] = useState(initial);
  const [orders, setOrders] = useState(initial);
  const [summary, setSummary] = useState(initial);
  const [lists, setLists] = useState({ categories: [], brands: [] });

  const run = useCallback(async (setter, loader) => {
    setter((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await loader();
      setter({ data, loading: false, error: '' });
      return data;
    } catch (error) {
      setter((s) => ({ ...s, loading: false, error: getErrorMessage(error) }));
      return null;
    }
  }, []);

  const loadProducts = useCallback(async () => {
    const [data, categories, brands] = await Promise.all([
      run(setProducts, getProducts),
      getCategories().catch(() => []),
      getBrands().catch(() => [])
    ]);
    if (data) {
      setLists({
        categories: namesFrom(categories, data.map((p) => p.category)),
        brands: namesFrom(brands, data.map((p) => p.brand))
      });
    }
    return data;
  }, [run]);

  const loadOrders = useCallback(() => run(setOrders, getOrders), [run]);
  const loadSummary = useCallback(() => run(setSummary, getAnalyticsSummary), [run]);

  // Local updates after a save, so the screen changes without a full reload.
  const patchProducts = useCallback((ids, changes) => {
    const pick = new Set(ids);
    setProducts((s) =>
      s.data ? { ...s, data: s.data.map((p) => (pick.has(productId(p)) ? { ...p, ...changes } : p)) } : s
    );
  }, []);

  const replaceProduct = useCallback((product) => {
    setProducts((s) => {
      if (!s.data) return s;
      const id = productId(product);
      const exists = s.data.some((p) => productId(p) === id);
      return { ...s, data: exists ? s.data.map((p) => (productId(p) === id ? product : p)) : [product, ...s.data] };
    });
    setLists((l) => ({
      categories: namesFrom(l.categories, [product.category]),
      brands: namesFrom(l.brands, [product.brand])
    }));
  }, []);

  const removeProducts = useCallback((ids) => {
    const pick = new Set(ids);
    setProducts((s) => (s.data ? { ...s, data: s.data.filter((p) => !pick.has(productId(p))) } : s));
  }, []);

  const replaceOrder = useCallback((order) => {
    setOrders((s) =>
      s.data ? { ...s, data: s.data.map((o) => (productId(o) === productId(order) ? order : o)) } : s
    );
  }, []);

  const value = useMemo(
    () => ({
      products,
      orders,
      summary,
      lists,
      loadProducts,
      loadOrders,
      loadSummary,
      patchProducts,
      replaceProduct,
      removeProducts,
      replaceOrder
    }),
    [products, orders, summary, lists, loadProducts, loadOrders, loadSummary, patchProducts, replaceProduct, removeProducts, replaceOrder]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
