import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const NotFound = () => {
  usePageMeta({
    title: 'Page not found',
    description: 'The page you are looking for could not be found.'
  });

  return (
    <div className="container flex flex-col items-center pt-16 text-center lg:pt-24">
      <p className="font-display text-[7rem] font-light leading-none tracking-tighter text-brand sm:text-[9rem]">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">This page doesn&apos;t exist</h1>
      <p className="mt-3 max-w-md text-muted">
        The link may be old or mistyped. Try the catalog, or search from the bar at the top.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/products" className="btn-primary px-7 py-3">
          Browse products
        </Link>
        <Link to="/" className="btn-outline px-7 py-3">
          Go to home page
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
