import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, title, subtitle, action, emptyAction }) => (
  <section className="space-y-6">
    {(title || subtitle || action) && (
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          {title && <h2 className="section-title trace">{title}</h2>}
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}

    {products.length ? (
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-lineStrong px-6 py-14 text-center">
        <SearchX className="h-8 w-8 text-silver" aria-hidden="true" />
        <p className="font-display text-lg font-medium text-ink">No products match these filters</p>
        <p className="max-w-sm text-sm text-muted">
          Try removing a filter or searching for something broader.
        </p>
        {emptyAction || (
          <Link to="/products" className="btn-outline mt-2">
            See all products
          </Link>
        )}
      </div>
    )}
  </section>
);

export default ProductGrid;
