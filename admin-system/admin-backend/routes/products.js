const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const router = express.Router();

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeStock = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }
  return numberValue;
};

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch (error) {
      return [value];
    }
  }
  return [];
};

const normalizeImages = (value) =>
  normalizeArray(value)
    .map((item) => (item === undefined || item === null ? '' : String(item).trim()))
    .filter(Boolean);

const normalizeSpecs = (value) =>
  normalizeArray(value)
    .map((item) => {
      const label = normalizeString(item?.label);
      const specValue = normalizeString(item?.value);
      if (!label && !specValue) {
        return null;
      }
      return { label, value: specValue };
    })
    .filter(Boolean);

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load products.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = normalizeString(req.body.name);
    const category = normalizeString(req.body.category);
    const subcategory = normalizeString(req.body.subcategory);
    const brand = normalizeString(req.body.brand);
    const description = normalizeString(req.body.description);
    const price = normalizeNumber(req.body.price);
    const featured = normalizeBoolean(req.body.featured, false);
    const published = normalizeBoolean(req.body.published, true);
    const condition = req.body.condition === 'used' ? 'used' : 'new';
    const images = normalizeImages(req.body.images);
    const specs = normalizeSpecs(req.body.specs);
    const stock = normalizeStock(req.body.stock);

    if (!name || !category || !brand || price === null) {
      return res.status(400).json({ message: 'Missing required product fields.' });
    }

    if (hasOwn(req.body, 'stock') && stock === null) {
      return res.status(400).json({ message: 'Stock must be a non-negative number.' });
    }

    const product = await Product.create({
      name,
      price,
      category,
      subcategory,
      brand,
      description,
      specs,
      images,
      featured,
      published,
      condition,
      stock: stock === null ? 0 : stock
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product.' });
  }
});

const MAX_BULK = 2000;
const BULK_FIELDS = ['published', 'featured', 'category', 'subcategory', 'brand', 'condition'];

// Apply one change to many products at once, or delete them.
// Body: { ids: [...], action: 'update' | 'delete', set: { published?, featured?, category?, subcategory?, brand? } }
router.post('/bulk', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
    const action = req.body?.action;

    if (!ids.length) {
      return res.status(400).json({ message: 'Select at least one product.' });
    }
    if (ids.length > MAX_BULK) {
      return res.status(400).json({ message: `You can change up to ${MAX_BULK} products at once.` });
    }
    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: 'One or more product ids are invalid.' });
    }

    if (action === 'delete') {
      const result = await Product.deleteMany({ _id: { $in: ids } });
      return res.json({ matched: result.deletedCount, modified: result.deletedCount });
    }

    if (action !== 'update') {
      return res.status(400).json({ message: 'Action must be update or delete.' });
    }

    const input = req.body?.set || {};
    const set = {};
    BULK_FIELDS.forEach((field) => {
      if (!hasOwn(input, field)) return;
      if (field === 'published' || field === 'featured') {
        set[field] = normalizeBoolean(input[field]);
      } else if (field === 'condition') {
        set[field] = input[field] === 'used' ? 'used' : 'new';
      } else {
        set[field] = normalizeString(input[field]);
      }
    });

    if (!Object.keys(set).length) {
      return res.status(400).json({ message: 'Nothing to change.' });
    }
    if ((hasOwn(set, 'category') && !set.category) || (hasOwn(set, 'brand') && !set.brand)) {
      return res.status(400).json({ message: 'Category and brand cannot be empty.' });
    }

    const result = await Product.updateMany({ _id: { $in: ids } }, { $set: set });
    return res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update products.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (hasOwn(req.body, 'name')) {
      product.name = normalizeString(req.body.name);
    }

    if (hasOwn(req.body, 'category')) {
      product.category = normalizeString(req.body.category);
    }

    if (hasOwn(req.body, 'subcategory')) {
      product.subcategory = normalizeString(req.body.subcategory);
    }

    if (hasOwn(req.body, 'brand')) {
      product.brand = normalizeString(req.body.brand);
    }

    if (hasOwn(req.body, 'description')) {
      product.description = normalizeString(req.body.description);
    }

    if (hasOwn(req.body, 'price')) {
      const nextPrice = normalizeNumber(req.body.price);
      if (nextPrice === null) {
        return res.status(400).json({ message: 'Price must be a number.' });
      }
      product.price = nextPrice;
    }

    if (hasOwn(req.body, 'featured')) {
      product.featured = normalizeBoolean(req.body.featured, product.featured);
    }

    if (hasOwn(req.body, 'published')) {
      product.published = normalizeBoolean(req.body.published, product.published !== false);
    }

    if (hasOwn(req.body, 'condition')) {
      product.condition = req.body.condition === 'used' ? 'used' : 'new';
    }

    if (hasOwn(req.body, 'images')) {
      product.images = normalizeImages(req.body.images);
    }

    if (hasOwn(req.body, 'specs')) {
      product.specs = normalizeSpecs(req.body.specs);
    }

    if (hasOwn(req.body, 'stock')) {
      const nextStock = normalizeStock(req.body.stock);
      if (nextStock === null) {
        return res.status(400).json({ message: 'Stock must be a non-negative number.' });
      }
      product.stock = nextStock;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});

module.exports = router;
