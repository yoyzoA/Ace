export const siteConfig = {
  name: 'ACE Computers SARL',
  tagline: 'Electronics and computer hardware in Batroun, Lebanon.',
  location: 'Hadadi Street, Batroun, Lebanon',
  phone: '+961 76 747 949',
  whatsapp: '96176747949',
  email: 'tonyassal@hotmail.com',
  logo: '/ace-logo.png',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://acecomputerslb.com',
  hoursNote: 'Open daily, closes 7 PM. Confirm exact hours before visiting for a specific day.',
  mapsQuery: 'Ace Computers sarl, Hadadi Street, Batroun, Lebanon',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Ace+Computers+sarl+Batroun+Lebanon',
  reviewsUrl: 'https://www.google.com/maps/place/Ace+Computers+sarl',
  reviews: {
    ratingValue: 4.5,
    reviewCount: 33,
    source: 'Google Reviews',
    highlights: [
      {
        author: 'Celena M.',
        quote:
          'Best in town for electronics and tech devices. Always has the latest models and the best options available.'
      },
      {
        author: 'Sam B.',
        quote: 'The best welcoming and quickest professional service.'
      }
    ]
  },
  social: {
    facebook: 'https://www.facebook.com/acecomputerslb',
    instagram: 'https://www.instagram.com/acecomputers.sarl',
    tiktok: 'https://www.tiktok.com/@acecomputerrs'
  },
  team: [{ name: 'Tony Assal', role: 'Owner' }],
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
  navItems: [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' }
  ],
  footerLinks: [
    { label: 'Products', path: '/products' },
    { label: 'About & team', path: '/about' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact & directions', path: '/contact' },
    { label: 'Privacy policy', path: '/privacy-policy' }
  ],
  hero: {
    title: 'Build faster. Play harder.',
    subtitle:
      'Explore a curated catalog of laptops, components, and peripherals with clear specs and transparent pricing.',
    primaryCta: { label: 'Browse catalog', path: '/products' },
    secondaryCta: { label: 'See featured gear', path: '/products?featured=true' }
  }
};
