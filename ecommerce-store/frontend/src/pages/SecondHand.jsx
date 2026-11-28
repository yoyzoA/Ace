import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Recycle, Tag } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductGrid from '../components/ProductGrid';
import { WhatsAppIcon } from '../components/BrandIcons';
import { getProducts } from '../services/api';
import { isSecondHand } from '../data/collections';
import { siteConfig } from '../data/siteConfig';
import { getAvailableStock } from '../utils/inventory';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePageStatus } from '../hooks/usePageStatus';

const points = [
  { Icon: BadgeCheck, title: 'Checked in store', text: 'Every item is tested at our Batroun shop before it goes on sale.' },
  { Icon: Tag, title: 'Priced below new', text: 'The same gear for less. Ask us how it compares with the new model.' },
  { Icon: Recycle, title: 'Sell us yours', text: 'Have something you no longer use? Tell us about it and we will make you an offer.' }
];

const sellMessage =
  'Hello ACE, I have a device I would like to sell or trade in. Model: … Condition: … (photos attached)';

const SecondHand = () => {
  usePageMeta({
    title: 'Second-hand offer',
    description:
      'Second-hand laptops, consoles, networking gear and more from ACE Computers in Batroun, checked in store and priced below new. Sell us your used device too.'
  });

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');
  usePageStatus(status);

  useEffect(() => {
    const load = async () => {
      try {
        setStatus('loading');
        setProducts(await getProducts());
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };
    load();
  }, []);

  const items = useMemo(
    () =>
      products
        .filter((product) => isSecondHand(product) && getAvailableStock(product) > 0)
        .sort((a, b) => a.price - b.price),
    [products]
  );

  const sellLink = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(sellMessage)}`;

  return (
    <div className="container space-y-12 pb-20 pt-6 lg:space-y-16">
      <Breadcrumbs items={[{ label: 'Second-hand', path: '/second-hand' }]} />

      <section className="relative overflow-hidden rounded-4xl bg-charcoal px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              <Recycle className="h-3.5 w-3.5" aria-hidden="true" />
              Second-hand offer
            </p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-5xl" style={{ textWrap: 'balance' }}>
              Good tech, second time around.
            </h1>
            <p className="max-w-lg text-lg text-white/75">
              Pre-owned gear checked in our Batroun store and priced below new. Selling something? We buy too.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a href="#available" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-charcoal hover:bg-brandSoft">
              See what&apos;s available
            </a>
            <a href={sellLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white hover:border-white">
              <WhatsAppIcon className="h-4 w-4" />
              Sell us your device
            </a>
          </div>
        </div>
        {/* circuit traces, as in the logo */}
        <svg className="pointer-events-none absolute -right-8 -top-6 h-64 w-64 text-brand/25" viewBox="0 0 200 200" fill="none" aria-hidden="true">
          <path d="M0 40h90v50h110M0 100h50v60h150M30 0v20h120v60" stroke="currentColor" strokeWidth="2" />
          <circle cx="90" cy="40" r="4" fill="currentColor" />
          <circle cx="50" cy="100" r="4" fill="currentColor" />
          <circle cx="150" cy="20" r="4" fill="currentColor" />
        </svg>
      </section>

      <section className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3" aria-label="How second-hand works">
        {points.map(({ Icon, title, text }) => (
          <div key={title} className="space-y-2 bg-white p-6">
            <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} aria-hidden="true" />
            <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
            <p className="text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </section>

      <div id="available" className="scroll-mt-28">
        {status === 'loading' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-mist" />
            ))}
          </div>
        )}
        {status === 'error' && (
          <p className="rounded-2xl border border-line bg-mist p-8 text-center text-muted">
            The list didn&apos;t load. Refresh the page or call us on {siteConfig.phone}.
          </p>
        )}
        {status === 'success' &&
          (items.length ? (
            <ProductGrid products={items} title="Available now" subtitle={`${items.length} second-hand ${items.length === 1 ? 'item' : 'items'} in stock`} />
          ) : (
            <div className="rounded-3xl border border-line p-10 text-center">
              <p className="font-display text-xl font-medium text-ink">Nothing second-hand in stock right now</p>
              <p className="mx-auto mt-2 max-w-md text-muted">
                New pieces come in often. Message us what you&apos;re looking for and we&apos;ll let you know.
              </p>
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer" className="btn-primary mt-5 inline-flex px-6 py-3">
                <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
              </a>
            </div>
          ))}
      </div>

      <section className="grid gap-6 rounded-4xl border border-line p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="space-y-3">
          <h2 className="section-title">Selling a laptop, console or phone?</h2>
          <p className="max-w-lg text-muted">
            Send us the model, its condition and a few photos on WhatsApp, or bring it to the store on {siteConfig.location.split(',')[0]}. We&apos;ll tell you what we can offer.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <a href={sellLink} target="_blank" rel="noreferrer" className="btn-primary flex-1 py-3">
            <WhatsAppIcon className="h-4 w-4" />
            Get an offer on WhatsApp
          </a>
          <Link to="/contact" className="btn-outline flex-1 py-3">
            Visit the store
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SecondHand;
