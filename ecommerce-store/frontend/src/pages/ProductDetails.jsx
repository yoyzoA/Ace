import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Banknote, Check, ImageOff, Minus, Plus, ShoppingBag, Store } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/BrandIcons';
import { useCart } from '../context/CartContext';
import { getProductById, getProducts } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePageStatus } from '../hooks/usePageStatus';
import { siteConfig } from '../data/siteConfig';
import { getAvailableStock } from '../utils/inventory';

const LOW_STOCK = 3;

const StockLine = ({ available }) => {
  if (available <= 0) {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-accentWarm">
        <span className="h-2 w-2 rounded-full bg-accentWarm" aria-hidden="true" />
        Out of stock
      </p>
    );
  }
  if (available <= LOW_STOCK) {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-accentWarm">
        <span className="h-2 w-2 rounded-full bg-accentWarm" aria-hidden="true" />
        {`Only ${available} left in stock`}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-success">
      <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
      In stock
    </p>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('idle');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, items } = useCart();

  usePageStatus(status);

  usePageMeta({
    title: product ? product.name : 'Product Details',
    description:
      product?.description || 'Explore specs, pricing, and availability for this product.'
  });

  useEffect(() => {
    let isActive = true;

    const loadProduct = async () => {
      try {
        setStatus('loading');
        setProduct(null);
        setRelated([]);
        setActiveImage(0);
        setQuantity(1);
        setAdded(false);
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
            .filter((item) => item.category === data.category && item.id !== data.id)
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

  const available = product ? getAvailableStock(product) : 0;
  const isOutOfStock = available <= 0;
  const inCart = product
    ? items.find((item) => item.productId === String(product.id))?.quantity || 0
    : 0;
  const maxAddable = Math.max(available - inCart, 0);
  const images = product?.images?.filter(Boolean) || [];

  const handleAdd = () => {
    if (!product || maxAddable <= 0) return;
    addItem(product.id, Math.min(quantity, maxAddable));
    setAdded(true);
    setQuantity(1);
  };

  const whatsappText = product
    ? encodeURIComponent(
        `Hi ACE, I'm interested in: ${product.name} (${formatPrice(product.price)})\n${siteConfig.siteUrl}/products/${product.id}`
      )
    : '';

  return (
    <div className="container space-y-12 pb-4 pt-8 lg:pt-10">
      <Breadcrumbs
        items={[
          { label: 'Products', path: '/products' },
          ...(product?.category
            ? [
                {
                  label: product.category,
                  path: `/products?category=${encodeURIComponent(product.category)}`
                }
              ]
            : []),
          { label: product ? product.name : 'Product', path: `/products/${id}` }
        ]}
      />

      {status === 'loading' && (
        <div className="grid gap-10 lg:grid-cols-2" aria-label="Loading product">
          <div className="aspect-square animate-pulse rounded-4xl bg-mist" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 animate-pulse rounded bg-mist" />
            <div className="h-9 w-4/5 animate-pulse rounded bg-mist" />
            <div className="h-8 w-1/3 animate-pulse rounded bg-mist" />
            <div className="h-24 animate-pulse rounded-2xl bg-mist" />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-line bg-mist p-10 text-center">
          <p className="font-display text-xl font-medium text-ink">We couldn&apos;t find that product</p>
          <p className="mt-2 text-sm text-muted">
            It may have been removed from the catalog, or the link is wrong.
          </p>
          <Link to="/products" className="btn-primary mt-6">
            Browse all products
          </Link>
        </div>
      )}

      {product && (
        <>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-4xl bg-mist">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="h-full w-full object-contain p-8 mix-blend-multiply sm:p-12"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-sm text-muted">
                    <ImageOff className="h-8 w-8 text-silver" aria-hidden="true" />
                    Photo coming soon
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="no-scrollbar flex gap-3 overflow-x-auto">
                  {images.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-mist p-2 transition-colors ${
                        index === activeImage ? 'border-accent' : 'border-transparent hover:border-line'
                      }`}
                      aria-label={`Show image ${index + 1}`}
                      aria-pressed={index === activeImage}
                    >
                      <img src={src} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buy box */}
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted">
                  {product.brand}
                  {product.subcategory ? <span className="text-silver"> / </span> : null}
                  {product.subcategory}
                </p>
                <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
                  {product.name}
                </h1>
                <p className="font-display text-3xl font-semibold tracking-tight text-ink">
                  {formatPrice(product.price)}
                </p>
                <StockLine available={available} />
              </div>

              {product.description && (
                <p className="max-w-prose leading-relaxed text-muted">{product.description}</p>
              )}

              <div className="space-y-3 rounded-3xl border border-line p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex h-12 items-center justify-between rounded-full border border-line px-1.5 sm:w-36">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-mist disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2ch] text-center font-semibold" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxAddable || 1, q + 1))}
                      disabled={quantity >= maxAddable || isOutOfStock}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-mist disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn-primary h-12 flex-1 text-base"
                    disabled={maxAddable <= 0}
                    onClick={handleAdd}
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    {isOutOfStock
                      ? 'Out of stock'
                      : maxAddable <= 0
                        ? 'All available stock is in your cart'
                        : 'Add to cart'}
                  </button>
                </div>

                {added && (
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-brandSoft px-4 py-3 text-sm"
                    role="status"
                  >
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      <Check className="h-4 w-4 text-success" aria-hidden="true" />
                      Added to cart
                    </span>
                    <Link to="/cart" className="font-semibold text-accent hover:text-accentHover">
                      View cart
                    </Link>
                  </div>
                )}

                <a
                  className="btn-outline h-12 w-full"
                  href={`https://wa.me/${siteConfig.whatsapp}?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#1f9d55]" />
                  Ask about this product
                </a>
              </div>

              <ul className="grid gap-3 text-sm sm:grid-cols-2">
                <li className="flex gap-3">
                  <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} aria-hidden="true" />
                  <span>
                    <span className="block font-semibold text-ink">Cash on delivery</span>
                    <span className="text-muted">Pay when your order arrives.</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Store className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} aria-hidden="true" />
                  <span>
                    <span className="block font-semibold text-ink">Pickup in Batroun</span>
                    <span className="text-muted">Or delivery for a small fee.</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Specs */}
          {product.specs?.length > 0 && (
            <section className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-14" aria-labelledby="specs-heading">
              <div className="space-y-3">
                <h2 id="specs-heading" className="section-title trace">
                  Specifications
                </h2>
                <p className="text-sm text-muted">
                  {`Questions about compatibility or bulk pricing? Call ${siteConfig.phone}.`}
                </p>
              </div>
              <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {product.specs.map((spec, index) => (
                  <div
                    key={`${product.id}-spec-${spec.label}`}
                    className={`grid grid-cols-[minmax(7rem,35%)_1fr] gap-4 px-5 py-3.5 text-sm ${
                      index % 2 === 0 ? 'bg-mist/60' : 'bg-white'
                    }`}
                  >
                    <dt className="text-muted">{spec.label}</dt>
                    <dd className="font-medium text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </>
      )}

      {related.length > 0 && (
        <ProductGrid
          products={related}
          title={`More in ${product?.category}`}
          action={
            <Link
              to={`/products?category=${encodeURIComponent(product?.category || '')}`}
              className="text-sm font-semibold text-accent hover:text-accentHover"
            >
              See all
            </Link>
          }
        />
      )}
    </div>
  );
};

export default ProductDetails;
