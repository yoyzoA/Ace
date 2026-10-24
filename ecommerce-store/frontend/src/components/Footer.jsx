import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from './BrandIcons';
import { siteConfig } from '../data/siteConfig';
import Logo from './Logo';

const socials = [
  { label: 'Facebook', href: siteConfig.social.facebook, Icon: FacebookIcon },
  { label: 'Instagram', href: siteConfig.social.instagram, Icon: InstagramIcon },
  { label: 'TikTok', href: siteConfig.social.tiktok, Icon: TikTokIcon }
];

const Footer = () => (
  <footer className="mt-24 border-t border-line bg-mist">
    <div className="container grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
      <div className="col-span-2 max-w-sm space-y-4 lg:col-span-1">
        <Link to="/" className="inline-flex" aria-label={`${siteConfig.name} home`}>
          <Logo className="h-12" />
        </Link>
        <p className="text-sm text-muted">{siteConfig.tagline}</p>
        <div className="flex gap-2">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-base font-semibold text-ink">Shop</h2>
        <ul className="space-y-2.5 text-sm">
          <li>
            <Link to="/products" className="text-muted hover:text-accent">
              All products
            </Link>
          </li>
          <li>
            <Link to="/products?featured=true" className="text-muted hover:text-accent">
              Featured gear
            </Link>
          </li>
          <li>
            <Link to="/cart" className="text-muted hover:text-accent">
              Your cart
            </Link>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-base font-semibold text-ink">Store</h2>
        <ul className="space-y-2.5 text-sm">
          {siteConfig.footerLinks
            .filter((link) => link.path !== '/products')
            .map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-muted hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div className="col-span-2 space-y-4 lg:col-span-1">
        <h2 className="font-display text-base font-semibold text-ink">Visit or call</h2>
        <ul className="space-y-3 text-sm">
          <li>
            <a
              href={siteConfig.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex gap-2.5 text-muted hover:text-accent"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {siteConfig.location}
            </a>
          </li>
          <li>
            <a
              href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
              className="flex gap-2.5 text-muted hover:text-accent"
            >
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {siteConfig.phone}
            </a>
          </li>
          <li>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex gap-2.5 text-muted hover:text-accent"
            >
              <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              WhatsApp us
            </a>
          </li>
        </ul>
        <p className="text-xs text-muted">{siteConfig.hoursNote}</p>
      </div>
    </div>

    <div className="border-t border-line">
      <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted md:flex-row">
        <span>{`© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`}</span>
        <Link to="/privacy-policy" className="hover:text-accent">
          Privacy policy
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
