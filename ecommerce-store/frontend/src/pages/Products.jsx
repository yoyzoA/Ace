import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Filters from '../components/Filters';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { usePageMeta } from '../hooks/usePageMeta';

const defaultFilters = {
  search: '',
  category: 'all',
  subcategory: 'all',
  brand: 'all',
  priceRange: null,
  featured: false
};

const Products = () => {
  usePageMeta({
    title: 'Products',
    description:
      'Browse electronics by brand, category, and price. Compare specs at a glance.'
  });

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    featured: searchParams.get('featured') === 'true'
  }));
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setStatus('loading');
        const data = await getProducts();
        setProducts(data);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    loadProducts();
  }, []);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 2000 };
    const max = Math.max(...products.map((product) => product.price));
    return { min: 0, max: Math.max(50, Math.ceil(max / 50) * 50) };
  }, [products]);

  const filterOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        products
          .filter((product) => filters.brand === 'all' || product.brand === filters.brand)
          .map((product) => product.category)
      )
    ).sort();

    const brands = Array.from(
      new Set(
        products
          .filter(
            (product) => filters.category === 'all' || product.category === filters.category
          )
          .map((product) => product.brand)
      )
    ).sort();

    const subcategories =
      filters.category === 'all'
        ? []
        : Array.from(
            new Set(
              products
                .filter((product) => product.category === filters.category && product.subcategory)
                .map((product) => product.subcategory)
            )
          ).sort();

    return {
      categories,
      brands,
      subcategories,
      priceBounds
    };
  }, [products, filters.category, filters.brand, priceBounds]);

  const filteredProducts = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term);
      const matchesCategory =
        filters.category === 'all' || product.category === filters.category;
      const matchesSubcategory =
        filters.subcategory === 'all' || product.subcategory === filters.subcategory;
      const matchesBrand =
        filters.brand === 'all' || product.brand === filters.brand;
      const matchesFeatured = !filters.featured || product.featured;
      const matchesPrice =
        !filters.priceRange ||
        (product.price >= filters.priceRange.min && product.price <= filters.priceRange.max);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesBrand &&
        matchesPrice &&
        matchesFeatured
      );
    });
  }, [products, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      if (key === 'category') {
        next.subcategory = 'all';
      }

      if (key === 'category' && prev.brand !== 'all') {
        const brandStillValid = products.some(
          (product) =>
            product.brand === prev.brand &&
            (value === 'all' || product.category === value)
        );
        if (!brandStillValid) next.brand = 'all';
      }

      if (key === 'brand' && prev.category !== 'all') {
        const categoryStillValid = products.some(
          (product) =>
            product.category === prev.category &&
            (value === 'all' || product.brand === value)
        );
        if (!categoryStillValid) next.category = 'all';
      }

      return next;
    });
  };

  const handleReset = () => {
    setFilters((prev) => ({
      ...defaultFilters,
      featured: prev.featured
    }));
  };

  const activeTags = useMemo(() => {
    const tags = [];

    if (filters.search.trim()) {
      tags.push({
        key: 'search',
        label: `"${filters.search.trim()}"`,
        onClear: () => setFilters((prev) => ({ ...prev, search: '' }))
      });
    }
    if (filters.category !== 'all') {
      tags.push({
        key: 'category',
        label: filters.category,
        onClear: () => handleFilterChange('category', 'all')
      });
    }
    if (filters.subcategory !== 'all') {
      tags.push({
        key: 'subcategory',
        label: filters.subcategory,
        onClear: () => handleFilterChange('subcategory', 'all')
      });
    }
    if (filters.brand !== 'all') {
      tags.push({
        key: 'brand',
        label: filters.brand,
        onClear: () => handleFilterChange('brand', 'all')
      });
    }
    if (filters.priceRange) {
      tags.push({
        key: 'price',
        label: `${formatPrice(filters.priceRange.min)} - ${formatPrice(filters.priceRange.max)}${
          filters.priceRange.max >= priceBounds.max ? '+' : ''
        }`,
        onClear: () => handleFilterChange('priceRange', null)
      });
    }
    if (filters.featured) {
      tags.push({
        key: 'featured',
        label: 'Featured only',
        onClear: () => setFilters((prev) => ({ ...prev, featured: false }))
      });
    }

    return tags;
  }, [filters, priceBounds]);

  return (
    <div className="container space-y-10 py-12">
      <div className="space-y-3">
        <p className="chip">Catalog</p>
        <h1 className="text-3xl font-semibold text-ink">Products</h1>
        <p className="text-sm text-muted">
          Filter by category, brand, and price to match your build.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={filters.search}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, search: event.target.value }))
          }
          placeholder="Search products by name, brand, or category..."
          className="w-full rounded-xl border border-line bg-panelStrong py-3 pl-11 pr-11 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Filters
          options={filterOptions}
          value={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          resultCount={filteredProducts.length}
        />

        <div className="space-y-6">
          {activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeTags.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={tag.onClear}
                  className="chip flex items-center gap-1.5 normal-case text-ink hover:border-accent hover:text-accent"
                >
                  {tag.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-accent"
              >
                Clear all
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div className="panel p-6 text-sm text-muted">Loading products...</div>
          )}
          {status === 'error' && (
            <div className="panel p-6 text-sm text-muted">
              We could not load the catalog right now. Please check back soon.
            </div>
          )}
          {status === 'success' && <ProductGrid products={filteredProducts} />}
        </div>
      </div>
    </div>
  );
};

export default Products;
