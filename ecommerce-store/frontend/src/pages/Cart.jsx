import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageOff, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrice } from '../utils/formatters';
import { getAvailableStock } from '../utils/inventory';
import Breadcrumbs from '../components/Breadcrumbs';

const Cart = () => {
  usePageMeta({
    title: 'Your Cart',
    description: 'Review your cart and adjust quantities before checkout.'
  });

  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!items.length) {
        setProducts([]);
        setStatus('idle');
        setError('');
        return;
      }

      try {
        setStatus('loading');
        setError('');
        const data = await getProducts();
        if (active) {
          setProducts(data);
          setStatus('success');
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError?.message || 'Failed to load cart items.');
          setStatus('error');
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [items]);

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      map.set(String(product.id), product);
    });
    return map;
  }, [products]);

  const cartItems = useMemo(
    () =>
      items.map((item) => {
        const product = productMap.get(item.productId);
        const available = product ? getAvailableStock(product) : 0;
        const lineTotal = product ? product.price * item.quantity : 0;
        return {
          ...item,
          product,
          available,
          lineTotal,
          hasIssue:
            !product || available <= 0 || item.quantity > Math.max(available, 0)
        };
      }),
    [items, productMap]
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = cartItems.length ? 5 : 0;
  const total = subtotal + deliveryFee;
  const hasBlockingIssues = cartItems.some((item) => item.hasIssue);

  const handleCheckout = () => {
    if (hasBlockingIssues || !cartItems.length || status === 'loading') {
      return;
    }
    navigate('/checkout');
  };


  if (!items.length) {
    return (
      <div className="container space-y-6 pt-8 lg:pt-10">
        <Breadcrumbs items={[{ label: 'Cart', path: '/cart' }]} />
        <div className="flex flex-col items-center rounded-4xl bg-mist px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-accent shadow-card">
            <ShoppingBag className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-2 max-w-sm text-muted">
            Browse the catalog and add what you need. You pay cash when your order arrives.
          </p>
          <Link to="/products" className="btn-primary mt-7 px-7 py-3">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8 pt-8 lg:pt-10">
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: 'Cart', path: '/cart' }]} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="page-title">Your cart</h1>
          <button
            type="button"
            className="text-sm font-semibold text-muted hover:text-accentWarm"
            onClick={clearCart}
          >
            Clear cart
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-accentWarm/30 bg-accentWarm/5 p-4 text-sm text-accentWarm" role="alert">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <ul className="divide-y divide-line border-y border-line">
          {cartItems.map((item) => {
            const image = item.product?.images?.[0];
            return (
              <li key={item.productId} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  to={`/products/${item.productId}`}
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-mist sm:h-28 sm:w-28"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
                  ) : (
                    <ImageOff className="h-6 w-6 text-silver" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted">{item.product?.brand}</p>
                      <h2 className="font-display text-base font-medium leading-snug text-ink sm:text-lg">
                        {item.product ? (
                          <Link to={`/products/${item.productId}`} className="hover:text-accent">
                            {item.product.name}
                          </Link>
                        ) : (
                          'Unavailable product'
                        )}
                      </h2>
                      {item.product ? (
                        <p className="mt-0.5 text-sm text-muted">{`${formatPrice(item.product.price)} each`}</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-display text-lg font-semibold text-ink">
                      {item.product ? formatPrice(item.lineTotal) : '--'}
                    </p>
                  </div>

                  {item.hasIssue ? (
                    <p className="text-sm font-semibold text-accentWarm">
                      {item.product
                        ? item.available <= 0
                          ? 'Out of stock. Remove it to check out.'
                          : `Only ${item.available} in stock. Lower the quantity to check out.`
                        : 'No longer in the catalog. Remove it to check out.'}
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex h-10 items-center rounded-full border border-line px-1">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist"
                        onClick={() =>
                          item.quantity <= 1
                            ? removeItem(item.productId)
                            : updateQuantity(item.productId, item.quantity - 1)
                        }
                        aria-label={`Decrease quantity of ${item.product?.name || 'item'}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2.5ch] text-center text-sm font-semibold" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist disabled:opacity-40"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.available <= item.quantity}
                        aria-label={`Increase quantity of ${item.product?.name || 'item'}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accentWarm"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit space-y-5 rounded-3xl bg-mist p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-xl font-semibold text-ink">Order summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="font-medium text-ink">{formatPrice(deliveryFee)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-lineStrong/60 pt-4">
              <dt className="font-display text-lg font-semibold text-ink">Total</dt>
              <dd className="font-display text-2xl font-semibold text-ink">{formatPrice(total)}</dd>
            </div>
          </dl>

          {hasBlockingIssues ? (
            <p className="text-sm font-semibold text-accentWarm">Fix the items marked above to check out.</p>
          ) : null}

          <button
            type="button"
            className="btn-primary w-full py-3.5 text-base"
            onClick={handleCheckout}
            disabled={hasBlockingIssues || status === 'loading'}
          >
            Proceed to checkout
          </button>
          <p className="text-center text-xs text-muted">Pay cash on delivery. No card needed.</p>
          <Link to="/products" className="block text-center text-sm font-semibold text-accent hover:text-accentHover">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
