import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { CandyCane, Gift, Phone, Snowflake, Star, TreePine } from 'lucide-react';
import { ChristmasLights, GiftTag, PineSprig, XMAS } from '../components/ChristmasDecor';
import ChristmasBanner from '../components/ChristmasBanner';
import ProductGrid from '../components/ProductGrid';
import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/BrandIcons';
import { getProducts } from '../services/api';
import { christmas, isChristmasSeason } from '../data/christmas';
import { siteConfig } from '../data/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePageStatus } from '../hooks/usePageStatus';
import { getAvailableStock } from '../utils/inventory';

// Each budget gets its own festive color, icon and soft background.
const LOOKS = {
  stocking: { color: XMAS.red, tint: '#fdf1ef', icon: CandyCane },
  gifts: { color: XMAS.green, tint: '#eef7f1', icon: Gift },
  big: { color: '#c98a12', tint: '#fdf6e6', icon: Star }
};

const ChristmasGifts = () => {
  usePageMeta({
    title: 'Christmas gifts',
    description: `${christmas.motto} ${christmas.intro} ACE Computers SARL, Batroun, Lebanon.`
  });

  const location = useLocation();
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

  // Jump to a budget section when the link has #stocking / #gifts / #big.
  useEffect(() => {
    if (status !== 'success' || !location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [status, location.hash]);

  const sections = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    const gifts = christmas.giftIds
      .map((id) => byId.get(id))
      .filter((product) => product && getAvailableStock(product) > 0);
    let min = 0;
    return christmas.budgets.map((budget) => {
      const items = gifts
        .filter((product) => product.price >= min && product.price < budget.max)
        .sort((a, b) => a.price - b.price);
      min = budget.max;
      return { ...budget, items };
    });
  }, [products]);

  if (!isChristmasSeason()) return <Navigate to="/products" replace />;

  const visible = sections.filter((section) => section.items.length);

  return (
    <div className="relative pb-20">
      {/* String of lights across the top of the page */}
      <ChristmasLights className="-mb-2" />

      <div className="container space-y-12 pt-2 lg:space-y-16">
        <Breadcrumbs items={[{ label: christmas.navLabel, path: christmas.path }]} />

        <div className="relative">
          <PineSprig className="absolute -left-3 -top-7 z-10 w-24 sm:-left-6 sm:w-32" />
          <PineSprig flip className="absolute -right-3 -top-7 z-10 w-24 sm:-right-6 sm:w-32" />
          <ChristmasBanner products={products} compact />
        </div>

        {status === 'success' && visible.length > 0 && (
          <nav className="flex flex-wrap items-center gap-3" aria-label="Gift budgets">
            <span className="text-sm font-medium text-muted">Shop by budget:</span>
            {visible.map((section) => {
              const look = LOOKS[section.id];
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/40"
                >
                  <GiftTag color={look.color}>{section.note}</GiftTag>
                </a>
              );
            })}
          </nav>
        )}

        {status === 'loading' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading gifts">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-mist" />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-line bg-mist p-8 text-center">
            <p className="font-display text-lg font-medium text-ink">The gifts didn&apos;t load</p>
            <p className="mt-2 text-sm text-muted">
              Check your connection and refresh the page, or call us on {siteConfig.phone}.
            </p>
          </div>
        )}

        {status === 'success' &&
          visible.map((section) => {
            const look = LOOKS[section.id];
            const Icon = look.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="relative scroll-mt-28 overflow-hidden rounded-4xl px-4 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10"
                style={{ background: look.tint }}
                aria-labelledby={`${section.id}-heading`}
              >
                {/* candy-stripe ribbon along the top edge */}
                <div
                  className="absolute inset-x-0 top-0 h-2"
                  style={{
                    background: `repeating-linear-gradient(-45deg, ${look.color} 0 10px, #ffffff 10px 20px)`
                  }}
                  aria-hidden="true"
                />
                <Snowflake
                  className="pointer-events-none absolute -right-6 -top-4 h-36 w-36 opacity-[0.08] sm:h-48 sm:w-48"
                  style={{ color: look.color }}
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <div className="relative mb-6 flex flex-wrap items-center gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-card"
                    style={{ background: look.color }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-1.5">
                    <h2 id={`${section.id}-heading`} className="section-title">
                      {section.title}
                    </h2>
                    <GiftTag color={look.color}>{section.note}</GiftTag>
                  </div>
                </div>
                <ProductGrid products={section.items} />
              </section>
            );
          })}

        {/* Season's greetings */}
        <section
          className="xmas-snowfall relative overflow-hidden rounded-4xl px-6 pb-10 pt-4 text-white sm:px-10"
          style={{ background: 'linear-gradient(135deg, #123d2b 0%, #0f2f22 55%, #231f20 100%)' }}
          aria-labelledby="greetings-heading"
        >
          <ChristmasLights swags={4} className="-mx-6 mb-4 w-auto sm:-mx-10" />
          <div className="relative grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <TreePine className="hidden h-24 w-24 lg:block" style={{ color: XMAS.gold }} strokeWidth={1.25} aria-hidden="true" />
            <div className="space-y-3">
              <p className="font-display text-sm font-medium uppercase tracking-[0.16em]" style={{ color: XMAS.gold }}>
                Merry Christmas from all of us at ACE
              </p>
              <h2 id="greetings-heading" className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
                Not sure what they already have?
              </h2>
              <p className="max-w-lg text-white/80">
                Tell us who it&apos;s for and your budget, and we&apos;ll suggest something that fits. You can also
                browse the full catalog.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-charcoal transition-colors hover:bg-brandSoft"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#1f9d55]" />
                Ask on WhatsApp
              </a>
              <a
                href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:border-white"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {siteConfig.phone}
              </a>
              <Link to="/products" className="text-center text-sm font-semibold text-white/80 underline-offset-4 hover:underline">
                Browse all products
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChristmasGifts;
