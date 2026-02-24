const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const existing = await Category.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, 'i')
    });

    if (existing) {
      return res.json(existing);
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category.' });
  }
});

module.exports = router;
