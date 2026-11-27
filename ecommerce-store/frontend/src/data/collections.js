// Product groups that cut across categories. Each has a URL
// (/products?collection=<id>) and can show as a tile on the home page.

const SECOND_HAND_NAME = /\b(used|2nd[\s-]?hand|second[\s-]?hand|refurb(ished)?|open[\s-]?box)\b/i;

// Second-hand: marked as used in the admin app, or "USED" in the product name.
export const isSecondHand = (product) =>
  product?.condition === 'used' || SECOND_HAND_NAME.test(product?.name || '');

export const collections = {
  speakers: {
    label: 'Speakers',
    description: 'Bluetooth, desktop, gaming and party speakers.',
    test: (p) => /\b(speakers?|soundbar|sound bar)\b/i.test(`${p?.name || ''} ${p?.subcategory || ''}`)
  },
  'second-hand': {
    label: 'Second-hand',
    description: 'Checked, working pre-owned gear at a lower price.',
    test: isSecondHand
  }
};

export const getCollection = (id) => (id && collections[id] ? { id, ...collections[id] } : null);
