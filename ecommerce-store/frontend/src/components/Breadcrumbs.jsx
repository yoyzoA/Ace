import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const Breadcrumbs = ({ items }) => {
  const trail = [{ label: 'Home', path: '/' }, ...items];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${siteConfig.siteUrl}${item.path}`
    }))
  };

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
              {isLast ? (
                <span className="font-semibold text-ink" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="hover:text-accent">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </nav>
  );
};

export default Breadcrumbs;
