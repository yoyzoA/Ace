const mongoose = require('mongoose');
const Product = require('../models/Product');

const buildFilters = (query) => {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }

  if (query.brand) {
    filters.brand = query.brand;
  }

  if (query.featured === 'true') {
    filters.featured = true;
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) {
      filters.price.$gte = Number(query.minPrice);
    }
    if (query.maxPrice) {
      filters.price.$lte = Number(query.maxPrice);
    }
  }

  return filters;
};

const getProducts = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const products = await Product.find(filters).sort({ createdAt: -1 });

    res.json({ data: products });
  } catch (error) {
    console.error('Failed to fetch products', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ data: product });
  } catch (error) {
    console.error('Failed to fetch product', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
};

module.exports = {
  getProducts,
  getProductById
};
