import { Link } from 'react-router-dom';
import { formatPrice, formatSpecLine } from '../utils/formatters';

const ProductCard = ({ product }) => {
  const specs = product.specs?.slice(0, 3) || [];
  const image = product.images?.[0];

  return (
    <Link
      to={`/products/${product.id}`}
      className="group panel flex h-full flex-col overflow-hidden transition hover:border-accent"
    >
      <div className="aspect-[4/3] overflow-hidden bg-panelStrong">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            Image coming soon
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <span className="chip">{product.category}</span>
          <span className="text-xs text-muted">{product.brand}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">{product.name}</h3>
          <p className="mt-2 text-xl font-semibold text-accent">
            {formatPrice(product.price)}
          </p>
        </div>
        <ul className="space-y-1 text-xs text-muted">
          {specs.map((spec) => (
            <li key={`${product.id}-${spec.label}`}>{formatSpecLine(spec)}</li>
          ))}
        </ul>
        <span className="mt-auto text-sm font-semibold text-ink">View details</span>
      </div>
    </Link>
  );
};

export default ProductCard;
