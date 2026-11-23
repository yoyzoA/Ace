import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Gift, Phone } from 'lucide-react';
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

  return (
    <div className="container space-y-12 pb-20 pt-6 lg:space-y-16">
      <Breadcrumbs items={[{ label: christmas.navLabel, path: christmas.path }]} />

      <ChristmasBanner products={products} compact />

      {status === 'success' && (
        <nav className="flex flex-wrap gap-2" aria-label="Gift budgets">
          {sections
            .filter((section) => section.items.length)
            .map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:bg-brandSoft/50"
              >
                <Gift className="h-4 w-4 text-[#d8433b]" aria-hidden="true" />
                {section.note}
              </a>
            ))}
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
        sections
          .filter((section) => section.items.length)
          .map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-28">
              <ProductGrid products={section.items} title={section.title} subtitle={section.note} />
            </div>
          ))}

      <section className="grid gap-6 rounded-4xl border border-line p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div className="space-y-3">
          <h2 className="section-title">Not sure what they already have?</h2>
          <p className="max-w-lg text-muted">
            Tell us who it&apos;s for and your budget, and we&apos;ll suggest something that fits. You can also
            browse the full catalog.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex-1 py-3"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Ask on WhatsApp
          </a>
          <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="btn-outline flex-1 py-3">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {siteConfig.phone}
          </a>
        </div>
        <Link to="/products" className="text-sm font-semibold text-accent hover:text-accentHover lg:col-span-2">
          Browse all products
        </Link>
      </section>
    </div>
  );
};

export default ChristmasGifts;
