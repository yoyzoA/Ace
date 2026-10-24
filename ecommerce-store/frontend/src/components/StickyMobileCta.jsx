import { Phone } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { WhatsAppIcon } from './BrandIcons';

const StickyMobileCta = () => (
  <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-white/95 p-2 backdrop-blur lg:hidden">
    <a
      href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-semibold text-ink"
    >
      <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
      Call
    </a>
    <a
      href={`https://wa.me/${siteConfig.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-charcoal py-2.5 text-sm font-semibold text-white"
    >
      <WhatsAppIcon className="h-4 w-4 text-[#25d366]" />
      WhatsApp
    </a>
  </div>
);

export default StickyMobileCta;
