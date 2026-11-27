export const siteConfig = {
  name: 'ACE Computers SARL',
  tagline: 'Computers and games store in Batroun, Lebanon, since 1996.',
  established: 1996,
  location: 'Hadadi Street, Batroun, Lebanon',
  phone: '+961 76 747 949',
  whatsapp: '96176747949',
  email: 'acecomputerslb@gmail.com',
  logo: '/ace-logo.png',
  // Same logo with the surrounding whitespace trimmed, for the header and footer.
  logoMark: '/ace-logo-mark.png',
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
    { label: 'Second-hand', path: '/second-hand' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ],
  footerLinks: [
    { label: 'Products', path: '/products' },
    { label: 'About & team', path: '/about' },
    { label: 'Second-hand offer', path: '/second-hand' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact & directions', path: '/contact' },
    { label: 'Privacy policy', path: '/privacy-policy' }
  ],
  hero: {
    title: 'Computers, consoles and games, picked by people who know them.',
    subtitle:
      'Laptops, consoles, games, PC parts and accessories from the computers and games store in Batroun, open since 1996.',
    primaryCta: { label: 'Browse catalog', path: '/products' },
    secondaryCta: { label: 'See featured gear', path: '/products?featured=true' }
  },
  services: [
    {
      title: 'Pay cash or with Whish',
      text: 'Order online and pay cash when it reaches you, or pay with Whish. No card needed.'
    },
    {
      title: 'Pickup or delivery',
      text: 'Collect from the store in Batroun, or have it delivered for a small fee.'
    },
    {
      title: 'Advice before you buy',
      text: 'Not sure which part fits your build? Call or WhatsApp us and ask.'
    }
  ]
};
