import { Link, useParams } from 'react-router-dom';
import { Check, Phone } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const steps = [
  { title: 'Order received', text: 'Your order is in our system.' },
  { title: 'We call to confirm', text: 'The ACE team calls the number you gave us.' },
  { title: 'Delivery or pickup', text: 'Pay in cash when you receive it.' }
];

const OrderSuccess = () => {
  const { id } = useParams();

  usePageMeta({
    title: 'Order placed',
    description: 'Your order has been placed successfully.'
  });

  return (
    <div className="container pt-10 lg:pt-16">
      <div className="mx-auto max-w-2xl space-y-10">
        <div className="space-y-5 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-white">
            <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <h1 className="page-title">Thanks, your order is placed</h1>
          <p className="text-muted">We&apos;ll call you shortly to confirm the details.</p>
          {id ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm text-muted">
              Order number
              <span className="font-semibold text-ink">{id}</span>
            </p>
          ) : null}
        </div>

        {/* A real sequence, so numbered steps fit here */}
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line p-5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  index === 0 ? 'bg-success text-white' : 'bg-mist text-ink'
                }`}
              >
                {index === 0 ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
              <p className="mt-3 font-display font-medium text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/products" className="btn-primary w-full px-7 py-3 sm:w-auto">
            Continue shopping
          </Link>
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
            className="btn-outline w-full px-7 py-3 sm:w-auto"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {siteConfig.phone}
          </a>
        </div>

        <p className="text-center text-sm text-muted">
          Questions about delivery?{' '}
          <Link to="/faq" className="font-semibold text-accent hover:text-accentHover">
            Read the FAQ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
