// Generates a full sitemap.xml (static pages + every product) into dist/,
// overwriting the minimal one copied from public/. This runs on every build
// (fast, no headless browser) so real search engines can discover and index
// the whole catalog even though it isn't individually prerendered.

import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://acecomputerslb.com').replace(/\/$/, '');
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://d3gq8urup3ba6k.cloudfront.net';
const DIST_DIR = path.resolve('dist');

const STATIC_ROUTES = [
  { loc: '/', priority: '1.0' },
  { loc: '/products', priority: '0.9' },
  { loc: '/about', priority: '0.6' },
  { loc: '/case-studies', priority: '0.5' },
  { loc: '/faq', priority: '0.5' },
  { loc: '/contact', priority: '0.7' },
  { loc: '/privacy-policy', priority: '0.3' }
];

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      default:
        return '&quot;';
    }
  });

async function fetchProductIds() {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  if (!res.ok) {
    throw new Error(`Products API responded with ${res.status}`);
  }
  const payload = await res.json();
  const products = payload.data || [];
  return products.map((product) => product._id || product.id).filter(Boolean);
}

async function main() {
  let productIds = [];
  try {
    productIds = await fetchProductIds();
  } catch (error) {
    console.warn('[sitemap] Could not fetch products, sitemap will only include static pages.');
    console.warn(error?.message || error);
  }

  const urls = [
    ...STATIC_ROUTES.map(
      ({ loc, priority }) =>
        `  <url>\n    <loc>${escapeXml(SITE_URL + loc)}</loc>\n    <priority>${priority}</priority>\n  </url>`
    ),
    ...productIds.map(
      (id) =>
        `  <url>\n    <loc>${escapeXml(`${SITE_URL}/products/${id}`)}</loc>\n    <priority>0.6</priority>\n  </url>`
    )
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), xml);
  console.log(`[sitemap] Wrote sitemap.xml with ${urls.length} URL(s) (${productIds.length} products).`);
}

main().catch((error) => {
  console.warn('[sitemap] Skipped: sitemap generation failed.');
  console.warn(error?.message || error);
});
