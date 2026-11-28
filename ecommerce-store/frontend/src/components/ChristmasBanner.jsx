import { Link } from 'react-router-dom';
import { Snowflake } from 'lucide-react';
import { christmas } from '../data/christmas';

/*
  The banner's signature: the right-angled "circuit" traces from the ACE logo
  become the strings that the gifts hang from, like baubles on a tree.
  Each bauble holds a real product photo from the store.
*/

const RED = '#d8433b';
const GOLD = '#f2c46d';

// Static snowfall: a few soft dots, drawn once (no motion).
const Snow = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-70"
    aria-hidden="true"
    style={{
      backgroundImage: [
        'radial-gradient(1.5px 1.5px at 8% 18%, #fff 50%, transparent 51%)',
        'radial-gradient(1px 1px at 22% 62%, #fff 50%, transparent 51%)',
        'radial-gradient(2px 2px at 36% 12%, #ffffffb3 50%, transparent 51%)',
        'radial-gradient(1px 1px at 47% 80%, #fff 50%, transparent 51%)',
        'radial-gradient(1.5px 1.5px at 58% 30%, #ffffffcc 50%, transparent 51%)',
        'radial-gradient(1px 1px at 69% 70%, #fff 50%, transparent 51%)',
        'radial-gradient(2px 2px at 81% 16%, #ffffffb3 50%, transparent 51%)',
        'radial-gradient(1px 1px at 92% 52%, #fff 50%, transparent 51%)',
        'radial-gradient(1.5px 1.5px at 14% 88%, #ffffffb3 50%, transparent 51%)',
        'radial-gradient(1px 1px at 74% 92%, #fff 50%, transparent 51%)'
      ].join(',')
    }}
  />
);

const Bauble = ({ product, size, drop, delay }) => {
  const image = product?.images?.[0];
  return (
    <div className="flex flex-col items-center" style={{ animationDelay: delay }}>
      {/* the circuit-trace string */}
      <span className="w-px bg-brand/70" style={{ height: drop }} aria-hidden="true" />
      <span className="h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-brand" aria-hidden="true" />
      {/* cap */}
      <span
        className="relative z-10 -mb-1.5 h-3 w-5 rounded-t-[3px]"
        style={{ background: GOLD }}
        aria-hidden="true"
      />
      {product ? (
        <Link
          to={`/products/${product.id}`}
          className="xmas-bauble group flex items-center justify-center rounded-full bg-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)] ring-4 ring-white/10 transition-transform duration-300 hover:-translate-y-1"
          style={{ width: size, height: size }}
          aria-label={product.name}
        >
          {image && (
            <img
              src={image}
              alt=""
              className="h-[72%] w-[72%] object-contain mix-blend-multiply"
              loading="lazy"
            />
          )}
        </Link>
      ) : (
        <span
          className="rounded-full"
          style={{ width: size, height: size, background: RED }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

const ChristmasBanner = ({ products = [], compact = false }) => {
  const byId = new Map(products.map((product) => [product.id, product]));
  const baubles = christmas.bannerProductIds.map((id) => byId.get(id));

  return (
    <section
      className="xmas-snowfall relative overflow-hidden rounded-4xl text-white"
      style={{ background: 'linear-gradient(135deg, #0a1f52 0%, #0f2f7a 45%, #231f20 100%)' }}
      aria-labelledby="xmas-heading"
    >
      <Snow />
      {/* top ribbon */}
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: RED }} aria-hidden="true" />

      <div
        className={`relative grid items-center gap-8 px-6 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:px-14 ${
          compact ? 'py-10 lg:py-12' : 'py-10 sm:py-12 lg:py-16'
        }`}
      >
        <div className="max-w-xl space-y-5">
          <p
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ background: RED }}
          >
            <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />
            Christmas at ACE
          </p>
          <h2
            id="xmas-heading"
            className="font-display text-[2.4rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]"
            style={{ textWrap: 'balance' }}
          >
            {christmas.motto}
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/80 sm:text-lg">{christmas.intro}</p>
          {!compact && (
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Link
                to={christmas.path}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-charcoal transition-colors hover:bg-brandSoft focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/60"
              >
                Shop Christmas gifts
              </Link>
              <Link
                to={`${christmas.path}#stocking`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors hover:border-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/60"
              >
                Gifts under $50
              </Link>
            </div>
          )}
        </div>

        {/* hanging gifts */}
        <div className="relative -mt-2 flex items-start justify-center gap-4 sm:gap-8 lg:-mt-16 lg:justify-end lg:-mb-6">
          {/* the horizontal trace they hang from */}
          <span className="absolute left-[10%] right-0 top-0 h-px bg-brand/70 lg:left-[18%]" aria-hidden="true" />
          <Bauble product={baubles[0]} size="clamp(88px, 22vw, 150px)" drop="clamp(28px, 6vw, 70px)" />
          <Bauble product={baubles[1]} size="clamp(104px, 27vw, 184px)" drop="clamp(56px, 11vw, 120px)" />
          <Bauble product={baubles[2]} size="clamp(80px, 20vw, 132px)" drop="clamp(16px, 4vw, 40px)" />
        </div>
      </div>
    </section>
  );
};

export default ChristmasBanner;
