import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/api';
import { siteConfig } from '../data/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';

const Home = () => {
  usePageMeta({
    title: 'Home',
    description:
      'Explore premium electronics, gaming gear, and components with clear specs and pricing.'
  });

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');

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
    () => products.filter((product) => product.featured).slice(0, 4),
    [products]
  );

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden">
        <div className="container relative flex flex-col items-start gap-10 py-16 lg:py-24">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-ink md:text-5xl">
              {siteConfig.hero.title}
            </h1>
            <p className="text-lg text-muted">{siteConfig.hero.subtitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={siteConfig.hero.primaryCta.path} className="btn-primary">
                {siteConfig.hero.primaryCta.label}
              </Link>
              <Link to={siteConfig.hero.secondaryCta.path} className="btn-outline">
                {siteConfig.hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        {status === 'loading' && (
          <div className="panel p-6 text-sm text-muted">Loading featured gear...</div>
        )}
        {status === 'error' && (
          <div className="panel p-6 text-sm text-muted">
            We could not load featured gear right now. Please check back soon.
          </div>
        )}
        {status === 'success' && (
          <ProductGrid
            products={featuredProducts}
            title="Featured gear"
            subtitle="Hand-picked highlights from our newest arrivals."
          />
        )}
      </section>
    </div>
  );
};

export default Home;
