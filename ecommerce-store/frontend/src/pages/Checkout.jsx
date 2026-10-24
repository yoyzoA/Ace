import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, ImageOff, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProducts, placeOrder } from '../services/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrice } from '../utils/formatters';
import { getAvailableStock } from '../utils/inventory';
import Breadcrumbs from '../components/Breadcrumbs';

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


  const crumbs = [
    { label: 'Cart', path: '/cart' },
    { label: 'Checkout', path: '/checkout' }
  ];

  if (!items.length) {
    return (
      <div className="container space-y-6 pt-8 lg:pt-10">
        <Breadcrumbs items={crumbs} />
        <div className="flex flex-col items-center rounded-4xl bg-mist px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-accent shadow-card">
            <ShoppingBag className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-2 max-w-sm text-muted">Add items to your cart before checking out.</p>
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
        <Breadcrumbs items={crumbs} />
        <h1 className="page-title">Checkout</h1>
      </div>

      {error ? (
        <div className="rounded-2xl border border-accentWarm/30 bg-accentWarm/5 p-4 text-sm text-accentWarm" role="alert">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Your details</h2>
              <p className="mt-1 text-sm text-muted">We&apos;ll call this number to confirm your order.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="field-label" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  value={formValues.name}
                  onChange={handleChange}
                  className="field"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="field-label" htmlFor="phone">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={formValues.phone}
                  onChange={handleChange}
                  className="field"
                  placeholder="+961..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="location">
                Delivery location
              </label>
              <input
                id="location"
                name="location"
                required
                autoComplete="street-address"
                value={formValues.location}
                onChange={handleChange}
                className="field"
                placeholder="Street, city, landmark"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-ink">Payment</h2>
            <div className="flex items-start gap-4 rounded-2xl border-2 border-accent bg-brandSoft/50 p-4">
              <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="font-semibold text-ink">Cash on delivery</p>
                <p className="text-sm text-muted">Pay in cash when your order arrives.</p>
              </div>
            </div>
          </section>

          {hasBlockingIssues ? (
            <p className="text-sm font-semibold text-accentWarm">
              Some items are no longer available.{' '}
              <Link to="/cart" className="underline">
                Update your cart
              </Link>{' '}
              to continue.
            </p>
          ) : null}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || hasBlockingIssues || status === 'loading'}
              className="btn-primary w-full py-3.5 text-base sm:w-auto sm:px-10"
            >
              {isSubmitting ? 'Placing order...' : `Place order, ${formatPrice(total)}`}
            </button>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Your details are only used to deliver this order.
            </p>
          </div>
        </form>

        <aside className="h-fit space-y-5 rounded-3xl bg-mist p-6 lg:sticky lg:top-32">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Order summary</h2>
            <Link to="/cart" className="text-sm font-semibold text-accent hover:text-accentHover">
              Edit
            </Link>
          </div>
          <ul className="space-y-4">
            {cartItems.map((item) => {
              const image = item.product?.images?.[0];
              return (
                <li key={item.productId} className="flex items-center gap-3">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-contain p-1.5" />
                    ) : (
                      <ImageOff className="h-5 w-5 text-silver" aria-hidden="true" />
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-charcoal px-1 text-[11px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="line-clamp-2 font-medium text-ink">
                      {item.product?.name || 'Unavailable item'}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {item.product ? formatPrice(item.lineTotal) : '--'}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-3 border-t border-lineStrong/60 pt-4 text-sm">
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
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
