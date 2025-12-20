import ProductCard from './ProductCard';

const ProductGrid = ({ products, title, subtitle }) => (
  <section className="space-y-6">
    {(title || subtitle) && (
      <div className="space-y-2">
        {title && <h2 className="text-2xl font-semibold text-ink">{title}</h2>}
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    )}

    {products.length ? (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    ) : (
      <div className="panel p-6 text-sm text-muted">
        No products match the selected filters.
      </div>
    )}
  </section>
);

export default ProductGrid;
