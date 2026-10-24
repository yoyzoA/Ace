import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from '../components/BrandIcons';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const Row = ({ Icon, label, children }) => (
  <div className="flex gap-4 py-5 first:pt-0">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brandSoft text-accent">
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-0.5 font-medium text-ink">{children}</div>
    </div>
  </div>
);

const Contact = () => {
  usePageMeta({
    title: 'Contact & Directions',
    description: `Visit ${siteConfig.name} at ${siteConfig.location}. Get directions, hours, and contact details.`
  });

  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    siteConfig.mapsQuery
  )}&output=embed`;

  const socials = [
    { label: 'Facebook', href: siteConfig.social.facebook, Icon: FacebookIcon },
    { label: 'Instagram', href: siteConfig.social.instagram, Icon: InstagramIcon },
    { label: 'TikTok', href: siteConfig.social.tiktok, Icon: TikTokIcon }
  ];

  return (
    <div className="container space-y-8 pt-8 lg:pt-10">
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: 'Contact', path: '/contact' }]} />
        <h1 className="page-title">Visit or get in touch</h1>
        <p className="max-w-xl text-muted">
          Call or WhatsApp for prices, stock and build advice, or come by the store in Batroun.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
        <div className="space-y-6">
          <div className="divide-y divide-line">
            <Row Icon={MapPin} label="Address">
              <a href={siteConfig.directionsUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                {siteConfig.location}
              </a>
            </Row>
            <Row Icon={Phone} label="Phone and WhatsApp">
              <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="hover:text-accent">
                {siteConfig.phone}
              </a>
            </Row>
            <Row Icon={Mail} label="Email">
              <a href={`mailto:${siteConfig.email}`} className="break-all hover:text-accent">
                {siteConfig.email}
              </a>
            </Row>
            <Row Icon={Clock} label="Hours">
              <span className="font-normal">{siteConfig.hoursNote}</span>
            </Row>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={siteConfig.directionsUrl} target="_blank" rel="noreferrer" className="btn-primary flex-1 py-3">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Get directions
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline flex-1 py-3"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#1f9d55]" />
              WhatsApp us
            </a>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm text-muted">Follow us</span>
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-4xl border border-line bg-mist">
          <iframe
            title={`Map showing ${siteConfig.name} location`}
            src={mapEmbedSrc}
            className="h-full min-h-[360px] w-full border-0 lg:min-h-[480px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
