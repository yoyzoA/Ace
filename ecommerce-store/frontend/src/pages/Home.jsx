import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Headset, ImageOff, MapPin, Store } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import Testimonials, { Stars } from '../components/Testimonials';
import { WhatsAppIcon } from '../components/BrandIcons';
import { getProducts } from '../services/api';
import { siteConfig } from '../data/siteConfig';
import { getCategoryIcon } from '../data/categoryIcons';
import { formatPrice } from '../utils/formatters';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePageStatus } from '../hooks/usePageStatus';

const serviceIcons = [Banknote, Store, Headset];

/*
  The hero's signature: the thin right-angled "circuit" lines from the ACE logo,
  wiring the headline to the product spotlight.
*/
const CircuitLines = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 600 520"
    preserveAspectRatio="none"
    fill="none"
    aria-hidden="true"
  >
    <g stroke="var(--color-brand)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" opacity="0.55">
      <path d="M0 120 H140 V60 H600" vectorEffect="non-scaling-stroke" />
      <path d="M0 400 H90 V470 H380 V520" vectorEffect="non-scaling-stroke" />
      <path d="M600 330 H520 V420 H460" vectorEffect="non-scaling-stroke" />
    </g>
    <g fill="var(--color-brand)">
      <circle cx="140" cy="120" r="3" />
      <circle cx="90" cy="400" r="3" />
      <circle cx="520" cy="330" r="3" />
    </g>
  </svg>
);

const Spotlight = ({ product, status }) => {
  if (status !== 'success' || !product) {
    return (
      <div className="relative flex aspect-[6/5] w-full items-center justify-center overflow-hidden rounded-4xl bg-mist">
        <CircuitLines />
        {status === 'loading' && (
          <div className="h-2/3 w-2/3 animate-pulse rounded-3xl bg-white/70" aria-hidden="true" />
        )}
      </div>
    );
  }

  const image = product.images?.[0];

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative block aspect-[6/5] w-full overflow-hidden rounded-4xl bg-mist"
    >
      <CircuitLines />
      <div className="absolute inset-0 flex items-center justify-center p-10 pb-28 sm:p-14 sm:pb-32">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ImageOff className="h-10 w-10 text-silver" aria-hidden="true" />
        )}
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-accent">Featured</p>
          <p className="truncate font-display text-base font-medium text-ink sm:text-lg">{product.name}</p>
        </div>
        <p className="shrink-0 font-display text-lg font-semibold text-ink sm:text-xl">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
};

const Home = () => {
  usePageMeta({
    title: 'Home',
    description:
      'Laptops, PC components, monitors, networking and accessories from ACE Computers SARL in Batroun, Lebanon. Cash on delivery and in-store pickup.'
  });

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');

  usePageStatus(status);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setStatus('loading');
        const data = await getProducts();
        setProducts(data);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    loadProducts();
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).slice(0, 8),
    [products]
  );

  const spotlight = useMemo(
    () => featuredProducts.find((product) => product.images?.[0]) || featuredProducts[0] || products[0],
    [featuredProducts, products]
  );

  const categories = useMemo(() => {
    const counts = new Map();
    products.forEach((product) => {
      if (!product.category) return;
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  return (
    <div>
      {/* Hero */}
      <section className="container grid items-center gap-10 pb-16 pt-10 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="max-w-xl space-y-7">
          <a
            href={siteConfig.reviewsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-line py-1.5 pl-2 pr-4 text-sm text-muted transition-colors hover:border-brand"
          >
            <span className="rounded-full bg-brandSoft px-2 py-0.5 text-xs font-semibold text-accent">
              {siteConfig.reviews.ratingValue}
            </span>
            <Stars value={siteConfig.reviews.ratingValue} className="h-3.5 w-3.5" />
            <span>{`${siteConfig.reviews.reviewCount} Google reviews`}</span>
          </a>

          <h1 className="font-display text-[2.5rem] font-medium leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.6rem]">
            {siteConfig.hero.title}
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted">{siteConfig.hero.subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={siteConfig.hero.primaryCta.path} className="btn-primary px-7 py-3.5 text-base">
              {siteConfig.hero.primaryCta.label}
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline px-7 py-3.5 text-base"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#1f9d55]" />
              Ask us on WhatsApp
            </a>
          </div>

          <p className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            {`In-store pickup at ${siteConfig.location}`}
          </p>
        </div>

        <Spotlight product={spotlight} status={status} />
      </section>

      {/* Categories */}
      {status === 'success' && categories.length > 0 && (
        <section className="container space-y-6 pb-16 lg:pb-20" aria-labelledby="categories-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="categories-heading" className="section-title trace">
              Shop by category
            </h2>
            <Link to="/products" className="text-sm font-semibold text-accent hover:text-accentHover">
              All products
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map(({ name, count }) => {
              const Icon = getCategoryIcon(name);
              return (
                <Link
                  key={name}
                  to={`/products?category=${encodeURIComponent(name)}`}
                  className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition-colors hover:border-brand/60 hover:bg-brandSoft/40 sm:gap-4 sm:p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-accent transition-colors group-hover:bg-white sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[0.95rem] font-medium text-ink sm:text-base">
                      {name}
                    </span>
                    <span className="block text-xs text-muted">
                      {`${count} ${count === 1 ? 'product' : 'products'}`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="container pb-16 lg:pb-24">
        {status === 'loading' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading products">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-line">
                <div className="aspect-square animate-pulse bg-mist" />
                <div className="space-y-2 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-mist" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-mist" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-mist" />
                </div>
              </div>
            ))}
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-2xl border border-line bg-mist p-8 text-center">
            <p className="font-display text-lg font-medium text-ink">The catalog didn&apos;t load</p>
            <p className="mt-2 text-sm text-muted">
              Check your connection and refresh the page, or call us on {siteConfig.phone}.
            </p>
          </div>
        )}
        {status === 'success' && featuredProducts.length > 0 && (
          <ProductGrid
            products={featuredProducts}
            title="Featured gear"
            subtitle="Hand-picked from what's in the store right now."
            action={
              <Link
                to="/products?featured=true"
                className="text-sm font-semibold text-accent hover:text-accentHover"
              >
                See all featured
              </Link>
            }
          />
        )}
      </section>

      {/* Services */}
      <section className="border-y border-line bg-mist" aria-label="How buying from ACE works">
        <div className="container grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {siteConfig.services.map((service, index) => {
            const Icon = serviceIcons[index] || Store;
            return (
              <div key={service.title} className="flex gap-4 py-7 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <h3 className="font-display text-lg font-medium text-ink">{service.title}</h3>
                  <p className="mt-1 text-sm text-muted">{service.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Testimonials />

      {/* Visit */}
      <section className="container pt-16 lg:pt-24">
        <div className="grid gap-8 rounded-4xl border border-line p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="section-title">Come see it before you buy</h2>
            <p className="max-w-lg text-muted">
              {`Our store is on ${siteConfig.location.replace(', Lebanon', '')}. Drop in to see products in person, pick up an order, or talk through a custom PC build with the team.`}
            </p>
            <p className="text-sm text-muted">{siteConfig.hoursNote}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={siteConfig.directionsUrl} target="_blank" rel="noreferrer" className="btn-primary flex-1 py-3">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Get directions
            </a>
            <Link to="/contact" className="btn-outline flex-1 py-3">
              Contact & hours
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
