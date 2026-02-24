const express = require('express');
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
    const brand = normalizeString(req.body.brand);
    const description = normalizeString(req.body.description);
    const price = normalizeNumber(req.body.price);
    const featured = normalizeBoolean(req.body.featured, false);
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
      brand,
      description,
      specs,
      images,
      featured,
      stock: stock === null ? 0 : stock
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product.' });
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
