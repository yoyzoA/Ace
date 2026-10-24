// Searches the web for photos of each product and saves up to 6 candidates per product,
// then builds contact sheets (sheets/sheet-XX.jpg) so the right photo can be picked.
// usage: node find_candidates.mjs [photo_queries.json]
// Safe to stop and re-run: products that already have candidates are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const inFile = path.resolve(process.argv[2] || path.join(here, 'photo_queries.json'));
const candDir = path.join(here, 'candidates');
const sheetDir = path.join(here, 'sheets');
const metaFile = path.join(here, 'candidates.json');
const PER_PRODUCT = 6;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const items = JSON.parse(fs.readFileSync(inFile, 'utf8'));
// Optional: product pages found for each product (photo_pages.json: { "<id>": ["https://...", ...] }).
// When a product has pages listed, its photo is taken from those pages instead of an image search.
const pagesFile = path.join(here, 'photo_pages.json');
const productPages = fs.existsSync(pagesFile) ? JSON.parse(fs.readFileSync(pagesFile, 'utf8')) : {};
const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
fs.mkdirSync(candDir, { recursive: true });
fs.mkdirSync(sheetDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout || 12000);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal, headers: { 'User-Agent': UA, ...(opts.headers || {}) } });
  } finally {
    clearTimeout(t);
  }
}

async function searchDuckDuckGo(q) {
  const page = await get(`https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=images&ia=images`);
  const html = await page.text();
  const m = html.match(/vqd=["']?([\d-]+)/);
  if (!m) return [];
  const res = await get(
    `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(q)}&vqd=${m[1]}&f=,,,,,&p=1`,
    { headers: { Referer: 'https://duckduckgo.com/', Accept: 'application/json' } }
  );
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  return (data?.results || []).map((r) => ({ url: r.image, width: r.width, height: r.height, source: r.url }));
}

async function searchBing(q) {
  const res = await get(`https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=1`);
  if (!res.ok) return [];
  const html = await res.text();
  const out = [];
  for (const m of html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)) {
    out.push({ url: m[1].replace(/&amp;/g, '&'), source: 'bing' });
  }
  return out;
}

function imagesFromPage(html, pageUrl) {
  const found = [];
  const add = (u) => {
    if (!u) return;
    u = u.replace(/&amp;/g, '&').trim();
    try {
      found.push(new URL(u, pageUrl).href);
    } catch {}
  };
  const metaRe = /<meta[^>]+(?:property|name|itemprop)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?|image)["'][^>]*>/gi;
  for (const tag of html.match(metaRe) || []) add((tag.match(/content=["']([^"']+)["']/i) || [])[1]);
  for (const tag of html.match(/<link[^>]+rel=["']image_src["'][^>]*>/gi) || []) add((tag.match(/href=["']([^"']+)["']/i) || [])[1]);
  for (const block of html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || []) {
    for (const m of block.matchAll(/"image"\s*:\s*(\[[^\]]*\]|"[^"]+"|\{[^}]*\})/g)) {
      for (const u of m[1].match(/https?:[^"\s]+/g) || []) add(u.replace(/\\\//g, '/'));
    }
  }
  return [...new Set(found)].filter((u) => !/logo|favicon|sprite|placeholder|\.svg(\?|$)/i.test(u));
}

async function fromPages(pages) {
  const out = [];
  for (const pageUrl of pages) {
    try {
      const res = await get(pageUrl, { headers: { Accept: 'text/html' } });
      if (!res.ok) continue;
      const html = await res.text();
      for (const u of imagesFromPage(html, pageUrl).slice(0, 3)) out.push({ url: u, source: pageUrl });
    } catch {}
    await sleep(800);
  }
  return out;
}

async function download(url) {
  const res = await get(url, { timeout: 15000, headers: { Accept: 'image/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 10 * 1024 * 1024) throw new Error('too large');
  const info = await sharp(buf).metadata();
  if (!info.width || info.width < 250 || info.height < 250) throw new Error('too small');
  return { buf, width: info.width, height: info.height };
}

let done = 0;
for (const item of items) {
  done += 1;
  if (meta[item.id]?.candidates?.length) continue;
  // With a product-page list, only those products are fetched (no image-search fallback).
  if (Object.keys(productPages).length && !productPages[item.id]) continue;
  // Search sites rate-limit quick repeated searches: when one comes back empty,
  // wait and try again (20s, then 60s, then 120s) before giving up on this product.
  let results = [];
  if (productPages[item.id]?.length) {
    results = await fromPages(productPages[item.id]);
    if (!results.length) console.log('   no photo found on its product pages');
  }
  for (const wait of results.length || productPages[item.id] ? [] : [0, 20000, 60000, 120000]) {
    if (wait) {
      console.log(`   search was refused, waiting ${wait / 1000}s and trying again...`);
      await sleep(wait);
    }
    try {
      results = await searchDuckDuckGo(item.query);
    } catch {}
    if (results.length < 3) {
      try {
        results = results.concat(await searchBing(item.query));
      } catch {}
    }
    if (results.length) break;
  }
  const dir = path.join(candDir, item.id);
  fs.mkdirSync(dir, { recursive: true });
  const candidates = [];
  const seen = new Set();
  for (const r of results) {
    if (candidates.length >= PER_PRODUCT) break;
    if (!r.url || seen.has(r.url) || /\.svg(\?|$)/i.test(r.url)) continue;
    seen.add(r.url);
    try {
      const { buf, width, height } = await download(r.url);
      const n = candidates.length + 1;
      fs.writeFileSync(path.join(dir, `${n}.orig`), buf);
      await sharp(buf)
        .flatten({ background: '#ffffff' })
        .resize(220, 220, { fit: 'contain', background: '#ffffff' })
        .jpeg({ quality: 80 })
        .toFile(path.join(dir, `${n}.jpg`));
      candidates.push({ n, url: r.url, width, height, source: r.source || '' });
    } catch {}
  }
  meta[item.id] = { name: item.name, query: item.query, candidates };
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
  console.log(`[${done}/${items.length}] ${item.name} -> ${candidates.length} photos`);
  await sleep(4000 + Math.random() * 3000);
}

// Contact sheets: 8 products per sheet, one row each, candidates numbered 1-6.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ROW = 240, LABEL = 300, CELL = 230, PER_SHEET = 8;
const width = LABEL + CELL * PER_PRODUCT + 10;
const index = [];
const ids = items.map((i) => i.id);
for (let s = 0; s * PER_SHEET < ids.length; s++) {
  const chunk = ids.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  const layers = [];
  chunk.forEach((id, r) => {
    const m = meta[id] || { name: id, candidates: [] };
    const num = s * PER_SHEET + r + 1;
    index.push({ num, id, name: m.name });
    const words = esc(m.name).split(' ');
    const lines = [''];
    for (const w of words) {
      if ((lines[lines.length - 1] + ' ' + w).length > 26) lines.push(w);
      else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
    }
    const text = lines.slice(0, 5).map((l, i) => `<text x="14" y="${70 + i * 26}" font-size="20" font-family="sans-serif" fill="#231f20">${l}</text>`).join('');
    layers.push({
      input: Buffer.from(`<svg width="${LABEL}" height="${ROW}"><rect width="100%" height="100%" fill="#f3f7fa"/><text x="14" y="38" font-size="28" font-weight="bold" font-family="sans-serif" fill="#0a76ab">#${num}</text>${text}</svg>`),
      top: r * ROW, left: 0
    });
    m.candidates.forEach((c, k) => {
      layers.push({ input: path.join(candDir, id, `${c.n}.jpg`), top: r * ROW + 10, left: LABEL + k * CELL + 5 });
      layers.push({
        input: Buffer.from(`<svg width="34" height="34"><rect width="34" height="34" rx="6" fill="#231f20"/><text x="17" y="24" font-size="20" font-weight="bold" text-anchor="middle" font-family="sans-serif" fill="#fff">${c.n}</text></svg>`),
        top: r * ROW + 12, left: LABEL + k * CELL + 7
      });
    });
    if (!m.candidates.length) {
      layers.push({
        input: Buffer.from(`<svg width="400" height="40"><text x="0" y="28" font-size="22" font-family="sans-serif" fill="#b4461b">No photos found</text></svg>`),
        top: r * ROW + 100, left: LABEL + 20
      });
    }
  });
  await sharp({ create: { width, height: chunk.length * ROW, channels: 3, background: '#ffffff' } })
    .composite(layers)
    .jpeg({ quality: 78 })
    .toFile(path.join(sheetDir, `sheet-${String(s + 1).padStart(2, '0')}.jpg`));
}
fs.writeFileSync(path.join(sheetDir, 'index.json'), JSON.stringify(index, null, 2));
const found = Object.values(meta).filter((m) => m.candidates.length).length;
console.log(`\nDone. ${found}/${items.length} products have photo candidates. Contact sheets are in ${sheetDir}`);
