// Downloads each kept product's current (externally linked) photo and saves a copy
// on the website, in the same 800x800 WebP format as new photos:
//   ecommerce-store/frontend/public/products/<productId>.webp
// usage: node mirror_existing.mjs [mirror_list.json]
// Safe to re-run: products that already have a photo file are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const list = JSON.parse(fs.readFileSync(path.resolve(process.argv[2] || path.join(here, 'mirror_list.json')), 'utf8'));
const outDir = path.resolve(here, '../../../frontend/public/products');
fs.mkdirSync(outDir, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
// Wikimedia asks automated tools to identify themselves, and refuses anonymous browser-like requests.
const WIKI_UA = 'AceComputersCatalog/1.0 (https://acecomputerslb.com; product photo copy)';
const uaFor = (url) => (/wikimedia\.org/.test(url) ? WIKI_UA : UA);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Ask for the full-size original first when the stored link is a thumbnail.
function fullSizeCandidates(url) {
  const out = [];
  // Amazon: ..._AC_UY218_.jpg -> full size
  if (/media-amazon\.com/.test(url)) out.push(url.replace(/\._[^/]*?_\.(jpe?g|png|webp)$/i, '.$1'));
  // Wikimedia: /thumb/a/ab/File.jpg/250px-File.jpg -> /a/ab/File.jpg
  const wm = url.match(/^(https?:\/\/upload\.wikimedia\.org\/[^/]+\/[^/]+)\/thumb\/(.+?)\/\d+px-[^/]+$/);
  if (wm) out.push(`${wm[1]}/${wm[2]}`);
  // eBay: s-l64/s-l300 -> s-l1600
  if (/ebayimg\.com/.test(url)) out.push(url.replace(/s-l\d+\./, 's-l1600.'));
  out.push(url);
  return [...new Set(out)];
}

async function fetchImage(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': uaFor(url), Accept: 'image/*' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    if (!meta.width) throw new Error('not an image');
    return { buf, width: meta.width, height: meta.height };
  } finally {
    clearTimeout(t);
  }
}

async function save(buf, file) {
  const trimmed = await sharp(buf)
    .flatten({ background: '#ffffff' })
    .trim({ background: '#ffffff', threshold: 18 })
    .toBuffer()
    .catch(() => sharp(buf).flatten({ background: '#ffffff' }).toBuffer());
  await sharp(trimmed)
    .resize(704, 704, { fit: 'contain', background: '#ffffff' })
    .extend({ top: 48, bottom: 48, left: 48, right: 48, background: '#ffffff' })
    .webp({ quality: 82 })
    .toFile(file);
}

const report = { saved: [], skipped: [], failed: [] };
let n = 0;
for (const item of list) {
  n += 1;
  const file = path.join(outDir, `${item.id}.webp`);
  if (fs.existsSync(file)) {
    report.skipped.push(item.id);
    continue;
  }
  let ok = false;
  for (const url of fullSizeCandidates(item.url)) {
    try {
      const img = await fetchImage(url);
      if (img.width < 150 || img.height < 150) throw new Error('too small');
      await save(img.buf, file);
      report.saved.push({ id: item.id, from: url, size: `${img.width}x${img.height}` });
      console.log(`[${n}/${list.length}] ${item.name} -> saved (${img.width}x${img.height})`);
      ok = true;
      break;
    } catch {}
  }
  if (!ok) {
    report.failed.push({ id: item.id, name: item.name, url: item.url });
    console.log(`[${n}/${list.length}] ${item.name} -> FAILED`);
  }
  await sleep(/wikimedia\.org/.test(item.url) ? 1500 : 300);
}
fs.writeFileSync(path.join(here, 'mirror_report.json'), JSON.stringify(report, null, 2));
console.log(`\nDone. Saved ${report.saved.length}, already there ${report.skipped.length}, failed ${report.failed.length}.`);
