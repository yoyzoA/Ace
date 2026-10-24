// Turns the chosen candidate for each product into a clean 800x800 WebP on white,
// saved to ecommerce-store/frontend/public/products/<productId>.webp
// usage: node apply_photos.mjs picks.json        (picks.json: { "<productId>": <candidate number> })
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const picks = JSON.parse(fs.readFileSync(path.resolve(process.argv[2] || path.join(here, 'picks.json')), 'utf8'));
const outDir = path.resolve(here, '../../../frontend/public/products');
fs.mkdirSync(outDir, { recursive: true });

const applied = [];
for (const [id, n] of Object.entries(picks)) {
  const src = path.join(here, 'candidates', id, `${n}.orig`);
  if (!fs.existsSync(src)) {
    console.log(`skip ${id}: candidate ${n} not found`);
    continue;
  }
  const trimmed = await sharp(fs.readFileSync(src))
    .flatten({ background: '#ffffff' })
    .trim({ background: '#ffffff', threshold: 18 })
    .toBuffer()
    .catch(() => sharp(fs.readFileSync(src)).flatten({ background: '#ffffff' }).toBuffer());
  await sharp(trimmed)
    .resize(704, 704, { fit: 'contain', background: '#ffffff' })
    .extend({ top: 48, bottom: 48, left: 48, right: 48, background: '#ffffff' })
    .webp({ quality: 82 })
    .toFile(path.join(outDir, `${id}.webp`));
  applied.push(id);
}
fs.writeFileSync(path.join(here, 'applied.json'), JSON.stringify(applied, null, 2));
console.log(`Saved ${applied.length} photos to ${outDir}`);
