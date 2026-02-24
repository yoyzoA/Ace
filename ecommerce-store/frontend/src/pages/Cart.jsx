import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrice } from '../utils/formatters';
import { getAvailableStock } from '../utils/inventory';

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
      <div className="container py-12">
        <div className="panel p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-3 text-sm text-muted">
            Browse the catalog and add items to get started.
          </p>
          <Link to="/products" className="btn-primary mt-6">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="chip">Cart</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Your cart</h1>
        </div>
        <button type="button" className="btn-outline" onClick={clearCart}>
          Clear cart
        </button>
      </div>

      {error ? (
        <div className="panel p-4 text-sm text-accentWarm">{error}</div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="panel flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    {item.product?.name || 'Unavailable product'}
                  </h2>
                  <p className="text-sm text-muted">{item.product?.brand}</p>
                  {item.product ? (
                    <p className="mt-2 text-sm text-ink">
                      {formatPrice(item.product.price)}
                    </p>
                  ) : null}
                </div>
                <div className="text-sm font-semibold text-ink">
                  {item.product ? formatPrice(item.lineTotal) : '--'}
                </div>
              </div>

              {item.hasIssue ? (
                <div className="text-xs font-semibold uppercase tracking-wide text-accentWarm">
                  {item.product
                    ? item.available <= 0
                      ? 'Out of stock'
                      : 'Quantity exceeds current stock'
                    : 'Item removed from catalog'}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="btn-outline px-3 py-1 text-xs"
                    onClick={() =>
                      item.quantity <= 1
                        ? removeItem(item.productId)
                        : updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold text-ink">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="btn-outline px-3 py-1 text-xs"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={item.available <= item.quantity}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-wide text-accent"
                  onClick={() => removeItem(item.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="panel h-fit p-6 space-y-4">
          <h2 className="text-lg font-semibold text-ink">Order summary</h2>
          <div className="space-y-2 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery fee</span>
              <span className="text-ink">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {hasBlockingIssues ? (
            <div className="text-xs font-semibold uppercase tracking-wide text-accentWarm">
              Update your cart before checkout.
            </div>
          ) : null}

          <button
            type="button"
            className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleCheckout}
            disabled={hasBlockingIssues || status === 'loading'}
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
