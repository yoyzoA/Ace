// Applies the catalog review to the live database:
//   - published: true/false  (which products show on the website)
//   - images: points products at photos hosted on the website (frontend/public/products/<id>.webp)
//
// usage (from ecommerce-store/backend):
//   node scripts/apply_catalog.js scripts/catalog_decisions.json            -> preview only, changes nothing
//   node scripts/apply_catalog.js scripts/catalog_decisions.json --apply    -> writes to the database
//
// Run --apply only AFTER the website with the new photos is deployed, so the photo links work.
// A backup of every product it changes is written first (scripts/backup_before_apply_<time>.json).
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const SITE = 'https://acecomputerslb.com';
const decisionsFile = process.argv[2];
const APPLY = process.argv.includes('--apply');
if (!decisionsFile) {
  console.error('Usage: node scripts/apply_catalog.js <catalog_decisions.json> [--apply]');
  process.exit(1);
}
const decisions = JSON.parse(fs.readFileSync(decisionsFile, 'utf8'));
const byId = new Map(decisions.map((d) => [d.id, d]));
const photoDir = path.resolve(__dirname, '../../frontend/public/products');
const hosted = new Set(
  fs.existsSync(photoDir) ? fs.readdirSync(photoDir).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)) : []
);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({}, 'name published images').lean();

  const changes = [];
  const stats = { show: 0, hide: 0, hostedPhoto: 0, comingSoon: 0, keptExternal: 0, notInList: 0 };

  for (const p of products) {
    const id = String(p._id);
    const d = byId.get(id);
    if (!d) {
      stats.notInList += 1; // created after the review: left exactly as it is
      continue;
    }
    const published = d.decision === 'keep';
    let images = p.images || [];
    if (published) {
      if (hosted.has(id)) {
        images = [`${SITE}/products/${id}.webp`];
        stats.hostedPhoto += 1;
      } else if (d.clearImage) {
        images = []; // old photo was a wrong/generic stand-in: show "Photo coming soon"
        stats.comingSoon += 1;
      } else if (images.length) {
        stats.keptExternal += 1;
      } else {
        stats.comingSoon += 1;
      }
    }
    published ? (stats.show += 1) : (stats.hide += 1);

    const same =
      (p.published !== false) === published && JSON.stringify(p.images || []) === JSON.stringify(images);
    if (!same) changes.push({ id, name: p.name, before: { published: p.published, images: p.images }, after: { published, images } });
  }

  console.log(`Products in database: ${products.length}`);
  console.log(`On website: ${stats.show}   Hidden: ${stats.hide}   Not in review (untouched): ${stats.notInList}`);
  console.log(`Shown products -> hosted photo: ${stats.hostedPhoto}, external photo kept: ${stats.keptExternal}, "photo coming soon": ${stats.comingSoon}`);
  console.log(`Products that will change: ${changes.length}`);

  if (!APPLY) {
    console.log('\nPreview only. Nothing was changed. Add --apply to write these changes.');
    await mongoose.connection.close();
    return;
  }

  const backup = path.join(__dirname, `backup_before_apply_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(backup, JSON.stringify(changes.map((c) => ({ id: c.id, name: c.name, ...c.before })), null, 2));
  console.log(`Backup written: ${backup}`);

  let done = 0;
  for (const c of changes) {
    // Write through the raw collection so this works even where the model has no `published` field yet.
    await Product.collection.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: c.after });
    done += 1;
  }
  console.log(`Updated ${done} products.`);
  await mongoose.connection.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
