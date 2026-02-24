import { useEffect, useMemo, useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import {
  createBrand,
  createCategory,
  createProduct,
  deleteProduct,
  getBrands,
  getCategories,
  getProducts,
  updateProduct,
  API_BASE_URL
} from '../api/adminApi';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Request failed.';

const normalizeName = (value) => (value ? String(value).trim() : '');

const mergeByName = (items, extraNames) => {
  const map = new Map();

  items.forEach((item) => {
    const name = normalizeName(item?.name || item);
    if (!name) {
      return;
    }
    map.set(name.toLowerCase(), item?.name ? item : { name });
  });

  extraNames.forEach((nameValue) => {
    const name = normalizeName(nameValue);
    if (!name) {
      return;
    }
    const key = name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { name });
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');

  const apiBase = API_BASE_URL;

  const summary = useMemo(() => {
    const featuredCount = products.filter((product) => product.featured).length;
    return {
      total: products.length,
      featured: featuredCount
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = normalizeName(search).toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter((product) =>
      [product.name, product.brand, product.category].some((value) =>
        normalizeName(value).toLowerCase().includes(query)
      )
    );
  }, [products, search]);

  const refreshData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productData, categoryData, brandData] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands()
      ]);

      setProducts(productData);
      setCategories(mergeByName(categoryData, productData.map((product) => product.category)));
      setBrands(mergeByName(brandData, productData.map((product) => product.brand)));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (product) => {
    const shouldDelete = window.confirm(`Delete "${product.name}"?`);
    if (!shouldDelete) {
      return;
    }

    setError('');
    try {
      await deleteProduct(product._id || product.id);
      await refreshData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setError('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id || editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setModalOpen(false);
      await refreshData();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (name) => {
    try {
      const created = await createCategory(name);
      setCategories((prev) => mergeByName(prev, [created?.name || name]));
      return created;
    } catch (categoryError) {
      setError(getErrorMessage(categoryError));
      return null;
    }
  };

  const handleAddBrand = async (name) => {
    try {
      const created = await createBrand(name);
      setBrands((prev) => mergeByName(prev, [created?.name || name]));
      return created;
    } catch (brandError) {
      setError(getErrorMessage(brandError));
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Catalog control
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Products</h1>
          <p className="mt-2 text-sm text-muted">API: {apiBase}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, brand, or category"
            className="w-72 rounded-full border border-outline bg-white/70 px-4 py-2 text-sm text-ink shadow-panel focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={refreshData}
            className="rounded-full border border-outline px-4 py-2 text-sm font-semibold text-ink"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-panel"
          >
            Add product
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-outline bg-panel p-4 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Total</p>
          <div className="mt-3 text-2xl font-semibold text-ink">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-outline bg-panel p-4 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Featured</p>
          <div className="mt-3 text-2xl font-semibold text-ink">{summary.featured}</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/40 bg-[rgba(186,67,67,0.08)] px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-outline bg-panel px-6 py-10 text-center text-sm text-muted">
          Loading products...
        </div>
      ) : filteredProducts.length ? (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="rounded-2xl border border-outline bg-panel px-6 py-10 text-center text-sm text-muted">
          No products found. Add your first product to get started.
        </div>
      )}

      <ProductForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialProduct={editingProduct}
        saving={saving}
        categories={categories}
        brands={brands}
        onAddCategory={handleAddCategory}
        onAddBrand={handleAddBrand}
      />
    </div>
  );
}
