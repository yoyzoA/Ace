import Breadcrumbs from '../components/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const Contact = () => {
  usePageMeta({
    title: 'Contact & Directions',
    description: `Visit ${siteConfig.name} at ${siteConfig.location}. Get directions, hours, and contact details.`
  });

  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    siteConfig.mapsQuery
  )}&output=embed`;

  return (
    <div className="container space-y-10 py-12">
      <Breadcrumbs items={[{ label: 'Contact', path: '/contact' }]} />

      <div className="space-y-3">
        <p className="chip">Contact</p>
        <h1 className="text-3xl font-semibold text-ink">Visit or reach out</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="panel space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Address</p>
            <p className="text-sm text-ink">{siteConfig.location}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</p>
            <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="text-sm text-ink">
              {siteConfig.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Hours</p>
            <p className="text-sm text-ink">{siteConfig.hoursNote}</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href={siteConfig.directionsUrl} target="_blank" rel="noreferrer" className="btn-primary">
              Get directions
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              WhatsApp us
            </a>
          </div>
          <div className="flex gap-4 pt-2 text-xs text-muted">
            <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer" className="hover:text-accent">
              Facebook
            </a>
            <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer" className="hover:text-accent">
              Instagram
            </a>
            <a href={siteConfig.social.tiktok} target="_blank" rel="noreferrer" className="hover:text-accent">
              TikTok
            </a>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <iframe
            title={`Map showing ${siteConfig.name} location`}
            src={mapEmbedSrc}
            className="h-full min-h-[320px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
