import { Link, useParams } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const OrderSuccess = () => {
  const { id } = useParams();

  usePageMeta({
    title: 'Order placed',
    description: 'Your order has been placed successfully.'
  });

  return (
    <div className="container py-12">
      <div className="panel space-y-4 p-8 text-center">
        <h1 className="text-2xl font-semibold text-ink">Order placed!</h1>
        <p className="text-sm text-muted">
          Thanks for your order. Our team will confirm it shortly.
        </p>
        {id ? (
          <div className="rounded-2xl border border-line bg-panelStrong px-4 py-3 text-sm text-ink">
            Order ID: <span className="font-semibold">{id}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/products" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/cart" className="btn-outline">
            View cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
