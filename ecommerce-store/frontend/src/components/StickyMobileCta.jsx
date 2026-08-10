import { Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const StickyMobileCta = () => (
  <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-canvas/95 backdrop-blur lg:hidden">
    <a
      href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
      className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-ink"
    >
      <Phone className="h-4 w-4" aria-hidden="true" />
      Call
    </a>
    <a
      href={`https://wa.me/${siteConfig.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="flex flex-1 items-center justify-center gap-2 border-l border-line bg-accent py-3 text-sm font-semibold text-canvas"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      WhatsApp
    </a>
  </div>
);

export default StickyMobileCta;
