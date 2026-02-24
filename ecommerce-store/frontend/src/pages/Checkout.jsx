import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts, placeOrder } from '../services/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrice } from '../utils/formatters';
import { getAvailableStock } from '../utils/inventory';

const Checkout = () => {
  usePageMeta({
    title: 'Checkout',
    description: 'Confirm your details and place a cash-on-delivery order.'
  });

  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!items.length) {
        setProducts([]);
        setStatus('idle');
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
          setError(fetchError?.message || 'Failed to load product updates.');
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || hasBlockingIssues || !cartItems.length) {
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const payload = {
        customer: {
          name: formValues.name.trim(),
          phone: formValues.phone.trim(),
          location: formValues.location.trim()
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await placeOrder(payload);
      const orderId = response?.orderId || response?.id || response?._id;
      if (!orderId) {
        throw new Error('Order placed but no order ID was returned.');
      }
      clearCart();
      navigate(`/order-success/${orderId}`, { replace: true });
    } catch (submitError) {
      setError(submitError?.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="container py-12">
        <div className="panel p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-3 text-sm text-muted">
            Add items to your cart before checking out.
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
      <div>
        <p className="chip">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Confirm your order</h1>
      </div>

      {error ? (
        <div className="panel p-4 text-sm text-accentWarm">{error}</div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <form className="panel space-y-6 p-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              value={formValues.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-line bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink" htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              required
              value={formValues.phone}
              onChange={handleChange}
              className="w-full rounded-2xl border border-line bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              placeholder="+961..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              required
              value={formValues.location}
              onChange={handleChange}
              className="w-full rounded-2xl border border-line bg-transparent px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              placeholder="Street, city, landmark"
            />
          </div>

          {hasBlockingIssues ? (
            <div className="text-xs font-semibold uppercase tracking-wide text-accentWarm">
              Update your cart. Some items are no longer available.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || hasBlockingIssues || status === 'loading'}
            className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </button>

          <p className="text-xs text-muted">
            Payment method: <span className="text-ink">Cash on Delivery</span>
          </p>
        </form>

        <div className="panel h-fit space-y-4 p-6">
          <h2 className="text-lg font-semibold text-ink">Order summary</h2>
          <div className="space-y-3 text-sm text-muted">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm text-ink">
                    {item.product?.name || 'Unavailable item'}
                  </p>
                  <p className="text-xs text-muted">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm text-ink">
                  {item.product ? formatPrice(item.lineTotal) : '--'}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-line pt-4 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery fee</span>
              <span className="text-ink">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
