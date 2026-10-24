import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ImageOff, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import { getAvailableStock } from '../utils/inventory';

const LOW_STOCK = 3;

const ProductCard = ({ product }) => {
  const specs = product.specs?.slice(0, 2) || [];
  const image = product.images?.[0];
  const available = getAvailableStock(product);
  const isOutOfStock = available <= 0;
  const isLowStock = !isOutOfStock && available <= LOW_STOCK;
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!justAdded) return undefined;
    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) {
      return;
    }
    addItem(product.id, 1);
    setJustAdded(true);
  };

  const productPath = `/products/${product.id}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[border-color,box-shadow] duration-200 hover:border-brand/50 hover:shadow-lift">
      <Link to={productPath} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-square overflow-hidden bg-mist">
          {image && !imageFailed ? (
            <img
              src={image}
              alt=""
              className={`h-full w-full object-contain p-6 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04] ${
                isOutOfStock ? 'opacity-50 grayscale' : ''
              }`}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted">
              <ImageOff className="h-6 w-6 text-silver" aria-hidden="true" />
              Photo coming soon
            </div>
          )}

          {(isOutOfStock || isLowStock || product.featured) && (
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {isOutOfStock ? (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-accentWarm shadow-sm">
                  Out of stock
                </span>
              ) : isLowStock ? (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-accentWarm shadow-sm">
                  {`Only ${available} left`}
                </span>
              ) : null}
              {product.featured && !isOutOfStock && (
                <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-charcoal">
                  Featured
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-medium text-muted">
          {product.brand}
          {product.brand && product.category ? <span className="text-silver"> / </span> : null}
          {product.category}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-base font-medium leading-snug text-ink">
          <Link to={productPath} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        {specs.length > 0 && (
          <p className="mt-2 line-clamp-1 text-xs text-muted">
            {specs.map((spec) => spec.value).join(', ')}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <p className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm sm:w-auto sm:px-3.5 font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${
              justAdded
                ? 'bg-success text-white'
                : isOutOfStock
                  ? 'bg-mist text-muted'
                  : 'bg-accent text-white hover:bg-accentHover'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
