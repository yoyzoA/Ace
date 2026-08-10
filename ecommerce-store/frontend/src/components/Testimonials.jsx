import { Star } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const Testimonials = () => {
  const { ratingValue, reviewCount, source, highlights } = siteConfig.reviews;

  return (
    <section className="container space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-ink">What customers say</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted">
            <span className="flex items-center gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-4 w-4"
                  fill={index < Math.round(ratingValue) ? 'currentColor' : 'none'}
                />
              ))}
            </span>
            <span>
              {ratingValue} out of 5 &middot; {reviewCount} {source}
            </span>
          </div>
        </div>
        <a href={siteConfig.reviewsUrl} target="_blank" rel="noreferrer" className="btn-outline">
          Read all reviews
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {highlights.map((review) => (
          <blockquote key={review.author} className="panel space-y-3 p-6">
            <p className="text-sm text-ink">&ldquo;{review.quote}&rdquo;</p>
            <footer className="text-xs text-muted">&mdash; {review.author}, {source}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
