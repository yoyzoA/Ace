import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const NotFound = () => {
  usePageMeta({
    title: 'Page not found',
    description: 'The page you are looking for could not be found.'
  });

  return (
    <div className="container flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="panel max-w-lg space-y-4 p-10">
        <p className="text-sm text-muted">404</p>
        <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
        <p className="text-sm text-muted">
          The catalog page you are looking for does not exist yet.
        </p>
        <Link to="/" className="btn-primary w-fit">
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
