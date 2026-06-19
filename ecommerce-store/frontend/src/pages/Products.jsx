import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Filters from '../components/Filters';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/api';
import { priceRanges } from '../data/catalogConfig';
import { usePageMeta } from '../hooks/usePageMeta';

const defaultFilters = {
  category: 'all',
  brand: 'all',
  priceRange: 'all',
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

    return {
      categories,
      brands,
      priceRanges
    };
  }, [products, filters.category, filters.brand]);

  const filteredProducts = useMemo(() => {
    const range = priceRanges.find((item) => item.id === filters.priceRange);

    return products.filter((product) => {
      const matchesCategory =
        filters.category === 'all' || product.category === filters.category;
      const matchesBrand =
        filters.brand === 'all' || product.brand === filters.brand;
      const matchesFeatured = !filters.featured || product.featured;

      const matchesPrice = !range || range.id === 'all' ? true :
        (range.min === undefined || product.price >= range.min) &&
        (range.max === undefined || product.price <= range.max);

      return matchesCategory && matchesBrand && matchesPrice && matchesFeatured;
    });
  }, [products, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

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
    setFilters({
      ...defaultFilters,
      featured: filters.featured
    });
  };

  return (
    <div className="container space-y-10 py-12">
      <div className="space-y-3">
        <p className="chip">Catalog</p>
        <h1 className="text-3xl font-semibold text-ink">Products</h1>
        <p className="text-sm text-muted">
          Filter by category, brand, and price to match your build.
        </p>
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
          {filters.featured && (
            <div className="flex items-center gap-3">
              <span className="chip">Featured only</span>
              <button
                type="button"
                className="text-xs font-semibold text-accent"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    featured: false
                  }))
                }
              >
                Clear
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
