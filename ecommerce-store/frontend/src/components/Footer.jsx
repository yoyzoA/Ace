import { Link } from 'react-router-dom';
import { siteConfig } from '../data/siteConfig';

const Footer = () => (
  <footer className="border-t border-line bg-canvas">
    <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
      <div className="max-w-md space-y-4">
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
          <a
            href={siteConfig.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-muted hover:text-accent"
          >
            {siteConfig.location}
          </a>
        )}
        {siteConfig.phone && (
          <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="block text-sm text-muted hover:text-accent">
            {siteConfig.phone}
          </a>
        )}
        <p className="text-sm text-muted">
          Precision hardware, transparent pricing, and expert build guidance.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Explore</p>
        <ul className="space-y-2 text-sm">
          {siteConfig.footerLinks.map((link) => (
            <li key={link.path}>
              <Link to={link.path} className="text-muted hover:text-accent">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Follow us</p>
        <ul className="space-y-2 text-sm">
          <li>
            <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">
              Facebook
            </a>
          </li>
          <li>
            <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">
              Instagram
            </a>
          </li>
          <li>
            <a href={siteConfig.social.tiktok} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">
              TikTok
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-line">
      <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted md:flex-row">
        <span>(c) {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
        <Link to="/privacy-policy" className="hover:text-accent">
          Privacy policy
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
