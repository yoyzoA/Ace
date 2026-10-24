// Read-only: exports the full catalog + online order counts so products can be reviewed offline.
// usage (from ecommerce-store/backend):  node scripts/export_catalog.js
// writes scripts/catalog_export.json
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');
const Order = require('../models/Order');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({}).lean();
  const orders = await Order.find({}, 'items status createdAt').lean();

  const sold = {};
  for (const order of orders) {
    if (order.status === 'Cancelled') continue;
    for (const item of order.items || []) {
      const id = String(item.productId);
      sold[id] = (sold[id] || 0) + (item.quantity || 0);
    }
  }

  const out = products.map((p) => ({
    id: String(p._id),
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    stock: p.stock,
    reserved: p.reserved,
    featured: p.featured,
    images: p.images || [],
    hasDescription: Boolean(p.description),
    specsCount: (p.specs || []).length,
    onlineUnitsSold: sold[String(p._id)] || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  }));

  const file = path.join(__dirname, 'catalog_export.json');
  fs.writeFileSync(file, JSON.stringify({ exportedAt: new Date(), orders: orders.length, products: out }, null, 2));
  console.log(`Exported ${out.length} products and ${orders.length} orders to ${file}`);
  await mongoose.connection.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
