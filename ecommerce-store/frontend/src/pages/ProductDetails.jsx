import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { getProductById, getProducts } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('idle');

  usePageMeta({
    title: product ? product.name : 'Product Details',
    description:
      product?.description ||
      'Explore specs, pricing, and availability for this product.'
  });

  useEffect(() => {
    let isActive = true;

    const loadProduct = async () => {
      try {
        setStatus('loading');
        setProduct(null);
        setRelated([]);
        const data = await getProductById(id);

        if (!isActive) {
          return;
        }

        setProduct(data);
        setStatus('success');

        try {
          const catalog = await getProducts();

          if (!isActive) {
            return;
          }

          const suggestions = catalog
            .filter(
              (item) => item.category === data.category && item.id !== data.id
            )
            .slice(0, 4);
          setRelated(suggestions);
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
        if (isActive) {
          setStatus('error');
        }
      }
    };

    loadProduct();

    return () => {
      isActive = false;
    };
  }, [id]);

  const highlightSpecs = product?.specs ? product.specs.slice(0, 4) : [];

  return (
    <div className="container space-y-10 py-12">
      <Link to="/products" className="text-sm text-muted">
        Back to catalog
      </Link>

      {status === 'loading' && (
        <div className="panel p-6 text-sm text-muted">Loading product...</div>
      )}

      {status === 'error' && (
        <div className="panel space-y-4 p-6 text-sm text-muted">
          <p>We could not load that product right now.</p>
          <Link to="/products" className="btn-outline w-fit">
            Back to products
          </Link>
        </div>
      )}

      {product && (
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="panel overflow-hidden">
              <div className="aspect-[4/3] bg-panelStrong">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    Image coming soon
                  </div>
                )}
              </div>
              <div className="border-t border-line p-5 text-sm text-muted">
                Catalog view only. Online checkout will be added soon.
              </div>
            </div>

            <div className="panel flex flex-col gap-6 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="chip">{product.category}</span>
                <span className="chip">{product.brand}</span>
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-ink">{product.name}</h1>
                <p className="mt-3 text-2xl font-semibold text-accent">
                  {formatPrice(product.price)}
                </p>
                {product.description && (
                  <p className="mt-4 text-sm text-muted">{product.description}</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {highlightSpecs.map((spec) => (
                  <div
                    key={`${product.id}-${spec.label}`}
                    className="rounded-xl border border-line bg-panelStrong px-4 py-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {spec.label}
                    </p>
                    <p className="text-sm text-ink">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary"
                  disabled
                  title="Checkout coming soon"
                >
                  Save to cart
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  disabled
                  title="Account coming soon"
                >
                  Save to wishlist
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="panel p-6">
              <h2 className="text-lg font-semibold text-ink">Full specifications</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.specs?.map((spec) => (
                  <div
                    key={`${product.id}-full-${spec.label}`}
                    className="flex items-center justify-between rounded-xl border border-line bg-panelStrong px-4 py-3 text-sm"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {spec.label}
                    </span>
                    <span className="text-ink">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel space-y-4 p-6">
              <h2 className="text-lg font-semibold text-ink">Contact</h2>
              <div className="rounded-xl border border-line bg-panelStrong p-4 text-sm text-muted">
                Need bulk pricing? Reach out to sales at {siteConfig.phone}.
              </div>
              <a
                className="btn-outline w-fit"
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M20.52 3.48A11.86 11.86 0 0 0 12.02 0C5.47 0 .16 5.3.16 11.85c0 2.1.55 4.15 1.6 5.97L0 24l6.36-1.67a11.86 11.86 0 0 0 5.66 1.45h.01c6.55 0 11.86-5.3 11.86-11.85 0-3.16-1.23-6.13-3.37-8.45zm-8.5 18.27h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.77.99 1.01-3.67-.24-.38a9.87 9.87 0 0 1-1.52-5.24c0-5.44 4.43-9.87 9.88-9.87a9.88 9.88 0 0 1 6.98 2.89 9.82 9.82 0 0 1 2.89 6.98c0 5.45-4.43 9.9-9.81 9.9zm5.74-7.83c-.31-.16-1.82-.9-2.1-1-.28-.1-.49-.16-.7.16-.2.31-.8 1-.98 1.2-.18.2-.36.23-.67.08-.31-.16-1.31-.48-2.49-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.54.16-.18.2-.31.31-.52.1-.2.05-.39-.03-.54-.08-.16-.7-1.68-.96-2.31-.25-.6-.5-.52-.7-.53h-.6c-.2 0-.54.08-.82.39-.28.31-1.07 1.05-1.07 2.55 0 1.5 1.1 2.96 1.25 3.17.16.2 2.17 3.31 5.26 4.64.73.31 1.3.5 1.75.64.74.23 1.41.2 1.94.12.59-.09 1.82-.74 2.08-1.45.26-.7.26-1.3.18-1.45-.08-.16-.28-.25-.59-.41z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <ProductGrid
          products={related}
          title={`More in ${product?.category}`}
          subtitle="Similar picks from the same category."
        />
      )}
    </div>
  );
};

export default ProductDetails;
