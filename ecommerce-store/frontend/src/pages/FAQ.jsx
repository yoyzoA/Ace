import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/BrandIcons';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteConfig } from '../data/siteConfig';

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We currently accept Cash on Delivery for online orders placed through the site.'
  },
  {
    question: 'Do you offer delivery or in-store pickup?',
    answer:
      'Both. You can pick up your order in-store in Batroun, or have it delivered; a delivery fee applies at checkout.'
  },
  {
    question: 'Where are you located?',
    answer: `${siteConfig.location}. See the map and directions on our Contact page.`
  },
  {
    question: 'Can I get bulk or business pricing?',
    answer: `Yes, reach out to our sales team at ${siteConfig.phone} or via WhatsApp for bulk pricing.`
  },
  {
    question: 'What about warranty and returns?',
    answer:
      'Warranty terms vary by product and brand. Check the product page or ask our team before purchase for specifics.'
  }
];

const FAQ = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  usePageMeta({
    title: 'FAQ',
    description: 'Answers to common questions about payment, delivery, pickup, and warranty at ACE Computers SARL.',
    schema
  });

  return (
    <div className="container pt-8 lg:pt-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div className="space-y-4">
          <Breadcrumbs items={[{ label: 'FAQ', path: '/faq' }]} />
          <h1 className="page-title">Questions, answered</h1>
          <p className="text-muted">
            Payment, delivery, pickup and warranty. Can&apos;t find what you need? Ask us directly.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#1f9d55]" />
              WhatsApp us
            </a>
            <Link to="/contact" className="btn-outline">
              Contact page
            </Link>
          </div>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {faqs.map((item, index) => (
            <details key={item.question} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <h2 className="font-display text-lg font-medium text-ink">{item.question}</h2>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-accent"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-prose pb-6 leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
