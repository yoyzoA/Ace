import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check, Phone, Smartphone } from 'lucide-react';
import { WhatsAppIcon } from '../components/BrandIcons';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const stepsFor = (whish) => [
  { title: 'Order received', text: 'Your order is in our system.' },
  whish
    ? { title: 'Pay with Whish', text: 'We send our Whish details on WhatsApp. Send the total there.' }
    : { title: 'We call to confirm', text: 'The ACE team calls the number you gave us.' },
  { title: 'Delivery or pickup', text: whish ? 'We confirm your payment, then deliver or keep it ready for pickup.' : 'Pay in cash when you receive it.' }
];

const OrderSuccess = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const whish = params.get('pay') === 'whish';
  const steps = stepsFor(whish);
  const shortNumber = `#${String(id || '').slice(-6).toUpperCase()}`;
  const whishMessage = `Hello ACE, I placed order ${shortNumber} on the website and want to pay with Whish.`;

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
              <span className="font-semibold text-ink">{shortNumber}</span>
            </p>
          ) : null}
        </div>

        {whish ? (
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-accent bg-brandSoft/50 p-5 sm:flex-row sm:items-center">
            <Smartphone className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">You chose to pay with Whish</p>
              <p className="text-sm text-muted">
                Message us on WhatsApp with your order number {shortNumber} and we&apos;ll send the Whish details.
              </p>
            </div>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whishMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary shrink-0 px-5 py-2.5"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>
        ) : null}

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
