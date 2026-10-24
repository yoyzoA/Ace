import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Filters from '../components/Filters';
import ProductGrid from '../components/ProductGrid';
import Breadcrumbs from '../components/Breadcrumbs';
import { getProducts } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { getAvailableStock } from '../utils/inventory';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePageStatus } from '../hooks/usePageStatus';

const defaultFilters = {
  search: '',
  category: 'all',
  subcategory: 'all',
  brand: 'all',
  priceRange: null,
  featured: false,
  inStock: false
};

const sortOptions = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' }
];

const filtersFromParams = (searchParams) => ({
  search: searchParams.get('search') || '',
  category: searchParams.get('category') || 'all',
  featured: searchParams.get('featured') === 'true'
});

const Products = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    ...filtersFromParams(searchParams)
  }));
  const [sort, setSort] = useState('relevance');
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');
  const [filtersOpen, setFiltersOpen] = useState(false);

  usePageMeta({
    title: filters.category !== 'all' ? filters.category : 'Products',
    description:
      'Browse laptops, components, monitors, networking and accessories by brand, category and price. Compare specs at a glance.'
  });

  usePageStatus(status);

  // Keep filters in sync when the URL changes (header search, category links).
  const paramsKey = searchParams.toString();
  useEffect(() => {
    setFilters((prev) => {
      const fromUrl = filtersFromParams(searchParams);
      const categoryChanged = fromUrl.category !== prev.category;
      return {
        ...prev,
        ...fromUrl,
        subcategory: categoryChanged ? 'all' : prev.subcategory
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

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

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 2000 };
    const max = Math.max(...products.map((product) => product.price));
    return { min: 0, max: Math.max(50, Math.ceil(max / 50) * 50) };
  }, [products]);

  const filterOptions = useMemo(() => {
    const categoryCounts = new Map();
    products
      .filter((product) => filters.brand === 'all' || product.brand === filters.brand)
      .forEach((product) => {
        if (!product.category) return;
        categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
      });

    const categories = Array.from(categoryCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));

    const brands = Array.from(
      new Set(
        products
          .filter(
            (product) => filters.category === 'all' || product.category === filters.category
          )
          .map((product) => product.brand)
          .filter(Boolean)
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

    const matches = products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.subcategory?.toLowerCase().includes(term);
      const matchesCategory =
        filters.category === 'all' || product.category === filters.category;
      const matchesSubcategory =
        filters.subcategory === 'all' || product.subcategory === filters.subcategory;
      const matchesBrand = filters.brand === 'all' || product.brand === filters.brand;
      const matchesFeatured = !filters.featured || product.featured;
      const matchesStock = !filters.inStock || getAvailableStock(product) > 0;
      const matchesPrice =
        !filters.priceRange ||
        (product.price >= filters.priceRange.min && product.price <= filters.priceRange.max);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesBrand &&
        matchesPrice &&
        matchesFeatured &&
        matchesStock
      );
    });

    if (sort === 'price-asc') return [...matches].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...matches].sort((a, b) => b.price - a.price);
    if (sort === 'name') return [...matches].sort((a, b) => a.name.localeCompare(b.name));
    return matches;
  }, [products, filters, sort]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      if (key === 'category') {
        next.subcategory = 'all';
      }

      if (key === 'category' && prev.brand !== 'all') {
        const brandStillValid = products.some(
          (product) =>
            product.brand === prev.brand && (value === 'all' || product.category === value)
        );
        if (!brandStillValid) next.brand = 'all';
      }

      if (key === 'brand' && prev.category !== 'all') {
        const categoryStillValid = products.some(
          (product) =>
            product.category === prev.category && (value === 'all' || product.brand === value)
        );
        if (!categoryStillValid) next.category = 'all';
      }

      return next;
    });
  };

  const handleReset = () => {
    setFilters({ ...defaultFilters });
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
        label: `${formatPrice(filters.priceRange.min)} to ${formatPrice(filters.priceRange.max)}${
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
    if (filters.inStock) {
      tags.push({
        key: 'inStock',
        label: 'In stock only',
        onClear: () => setFilters((prev) => ({ ...prev, inStock: false }))
      });
    }

    return tags;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, priceBounds]);

  const heading =
    filters.subcategory !== 'all'
      ? filters.subcategory
      : filters.category !== 'all'
        ? filters.category
        : filters.featured
          ? 'Featured gear'
          : 'All products';

  const filterPanel = (
    <Filters
      options={filterOptions}
      value={filters}
      onChange={handleFilterChange}
      onReset={handleReset}
      resultCount={filteredProducts.length}
      totalCount={products.length}
    />
  );

  return (
    <div className="container space-y-8 pb-4 pt-8 lg:pt-10">
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: 'Products', path: '/products' }]} />
        <h1 className="page-title">{heading}</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="catalog-search" className="sr-only">
            Search products
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            type="search"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Search by name, brand or category"
            className="field rounded-full py-3 pl-11 pr-11"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="btn-outline flex-1 py-3 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeTags.length > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 text-xs text-white">
                {activeTags.length}
              </span>
            )}
          </button>
          <label htmlFor="catalog-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="field flex-1 rounded-full py-3 sm:w-52 sm:flex-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-32">{filterPanel}</div>
        </aside>

        <div className="min-w-0 space-y-6">
          {activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeTags.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={tag.onClear}
                  className="flex items-center gap-1.5 rounded-full bg-brandSoft px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
                  aria-label={`Remove filter ${tag.label}`}
                >
                  {tag.label}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleReset}
                className="px-2 text-xs font-semibold text-muted hover:text-ink"
              >
                Clear all
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading products">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-line">
                  <div className="aspect-square animate-pulse bg-mist" />
                  <div className="space-y-2 p-5">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-mist" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-mist" />
                    <div className="h-5 w-1/3 animate-pulse rounded bg-mist" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-2xl border border-line bg-mist p-8 text-center">
              <p className="font-display text-lg font-medium text-ink">The catalog didn&apos;t load</p>
              <p className="mt-2 text-sm text-muted">Check your connection and refresh the page.</p>
            </div>
          )}
          {status === 'success' && (
            <ProductGrid
              products={filteredProducts}
              emptyAction={
                <button type="button" onClick={handleReset} className="btn-outline mt-2">
                  Clear filters
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">{filterPanel}</div>
            <div className="border-t border-line p-4">
              <button type="button" className="btn-primary w-full py-3" onClick={() => setFiltersOpen(false)}>
                {`Show ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
