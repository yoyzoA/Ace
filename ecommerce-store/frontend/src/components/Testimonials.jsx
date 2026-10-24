import { Star } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const Stars = ({ value, className = 'h-4 w-4' }) => (
  <span className="flex items-center gap-0.5 text-brand" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={className}
        fill={index < Math.round(value) ? 'currentColor' : 'none'}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

const Testimonials = () => {
  const { ratingValue, reviewCount, source, highlights } = siteConfig.reviews;

  return (
    <section className="bg-charcoal text-white" aria-labelledby="reviews-heading">
      <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div className="space-y-5">
          <h2 id="reviews-heading" className="font-display text-2xl font-semibold tracking-tight md:text-[1.75rem]">
            What customers say
          </h2>
          <div className="flex items-end gap-4">
            <span className="font-display text-6xl font-light leading-none tracking-tight text-white">
              {ratingValue}
            </span>
            <div className="space-y-1.5 pb-1">
              <Stars value={ratingValue} />
              <p className="text-sm text-white/70">{`${reviewCount} reviews on Google`}</p>
            </div>
          </div>
          <span className="sr-only">{`Rated ${ratingValue} out of 5 from ${reviewCount} ${source}`}</span>
          <a
            href={siteConfig.reviewsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand hover:text-brand"
          >
            Read all reviews
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {highlights.map((review) => (
            <figure
              key={review.author}
              className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <blockquote className="font-display text-lg font-light leading-relaxed text-white">
                {`“${review.quote}”`}
              </blockquote>
              <figcaption className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-semibold text-charcoal"
                >
                  {review.author.charAt(0)}
                </span>
                <span>
                  <span className="block font-semibold text-white">{review.author}</span>
                  <span className="block text-xs text-white/60">{source}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Stars };
export default Testimonials;
