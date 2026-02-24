const formatCurrency = (value) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numberValue);
};

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(220px,1.2fr)_0.7fr_0.7fr_0.4fr_0.6fr_0.5fr_0.8fr] gap-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        <div>Product</div>
        <div>Category</div>
        <div>Brand</div>
        <div>Stock</div>
        <div>Price</div>
        <div>Featured</div>
        <div className="text-right">Actions</div>
      </div>
      {products.map((product, index) => {
        const image =
          Array.isArray(product.images) && typeof product.images[0] === 'string'
            ? product.images[0]
            : null;

        return (
          <div
            key={product._id || product.id}
            style={{ animationDelay: `${index * 40}ms` }}
            className="grid animate-fade-up grid-cols-[minmax(220px,1.2fr)_0.7fr_0.7fr_0.4fr_0.6fr_0.5fr_0.8fr] items-center gap-4 rounded-2xl border border-outline bg-panel px-4 py-3 shadow-panel"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-[linear-gradient(135deg,rgba(10,113,94,0.2),rgba(222,132,55,0.2))]">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">{product.name}</div>
                <div className="text-xs text-muted">ID: {product._id || product.id}</div>
              </div>
            </div>
            <div className="text-sm text-ink">{product.category}</div>
            <div className="text-sm text-ink">{product.brand}</div>
            <div className="text-sm text-ink">{Number(product.stock || 0)}</div>
            <div className="text-sm font-semibold text-ink">{formatCurrency(product.price)}</div>
            <div>
              {product.featured ? (
                <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-ink">
                  Featured
                </span>
              ) : (
                <span className="rounded-full border border-outline px-3 py-1 text-xs text-muted">
                  Standard
                </span>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="rounded-full border border-outline px-3 py-1 text-xs font-semibold text-ink transition hover:border-accent"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="rounded-full border border-danger/40 px-3 py-1 text-xs font-semibold text-danger transition hover:border-danger"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
