import { siteConfig } from '../data/siteConfig';

const Footer = () => (
  <footer className="border-t border-line bg-canvas">
    <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {siteConfig.logo ? (
            <>
              <img
                src={siteConfig.logo}
                alt={`${siteConfig.name} logo`}
                className="h-10 w-auto max-w-[160px] rounded-lg bg-white px-2 py-1 object-contain"
              />
              <span className="sr-only">{siteConfig.name}</span>
            </>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel text-base font-bold text-accent">
              ACE
            </div>
          )}
          {!siteConfig.logo && (
            <div>
              <p className="font-display text-lg font-semibold">{siteConfig.name}</p>
              <p className="text-xs text-muted">{siteConfig.tagline}</p>
            </div>
          )}
        </div>
        {siteConfig.tagline && (
          <p className="text-sm text-muted">{siteConfig.tagline}</p>
        )}
        {siteConfig.location && (
          <p className="text-sm text-muted">{siteConfig.location}</p>
        )}
        {siteConfig.phone && (
          <p className="text-sm text-muted">{siteConfig.phone}</p>
        )}
        <p className="text-sm text-muted">
          Precision hardware, transparent pricing, and expert build guidance.
        </p>
      </div>

      {siteConfig.footerColumns.map((column) => (
        <div key={column.title} className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            {column.title}
          </p>
          <ul className="space-y-2 text-sm">
            {column.links.map((link) => (
              <li key={link} className="text-ink">
                {link}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-line">
      <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted md:flex-row">
        <span>(c) {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
        <span>Catalog-only experience. Payments and checkout coming later.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
