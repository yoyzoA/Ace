import Breadcrumbs from '../components/Breadcrumbs';
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
    <div className="container space-y-10 py-12">
      <Breadcrumbs items={[{ label: 'FAQ', path: '/faq' }]} />

      <div className="space-y-3">
        <p className="chip">FAQ</p>
        <h1 className="text-3xl font-semibold text-ink">Frequently asked questions</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((item) => (
          <div key={item.question} className="panel p-6">
            <h2 className="text-base font-semibold text-ink">{item.question}</h2>
            <p className="mt-2 text-sm text-muted">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
