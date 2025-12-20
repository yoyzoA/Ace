export const siteConfig = {
  name: 'ACE Computers SARL',
  tagline: 'Electronics and computer hardware in Batroun, Lebanon.',
  location: 'Hadadi Street, Batroun, Lebanon',
  phone: '+961 76 747 949',
  whatsapp: '96176747949',
  logo: '/ace-logo.png',
  navItems: [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' }
  ],
  hero: {
    title: 'Build faster. Play harder.',
    subtitle:
      'Explore a curated catalog of laptops, components, and peripherals with clear specs and transparent pricing.',
    primaryCta: { label: 'Browse catalog', path: '/products' },
    secondaryCta: { label: 'See featured gear', path: '/products?featured=true' },
    stats: [
      { label: 'SKUs ready', value: '120+' },
      { label: 'Top brands', value: '25' },
      { label: 'Ship-ready categories', value: '12' }
    ]
  },
  highlights: [
    {
      title: 'Curated inventory',
      description: 'Every item is vetted for performance, thermals, and longevity.'
    },
    {
      title: 'Spec-forward listings',
      description: 'Key specs are surfaced upfront so you can compare quickly.'
    },
    {
      title: 'Built for expansion',
      description: 'Catalog-first architecture ready for carts, auth, and checkout.'
    }
  ],
  footerColumns: [
    {
      title: 'Catalog',
      links: ['Laptops', 'Components', 'Monitors', 'Storage', 'Networking']
    },
    {
      title: 'Company',
      links: ['About', 'Careers', 'Press', 'Contact']
    },
    {
      title: 'Support',
      links: ['Build guides', 'Warranty', 'Shipping', 'FAQs']
    }
  ]
};
