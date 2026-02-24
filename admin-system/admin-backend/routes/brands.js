const express = require('express');
const Brand = require('../models/Brand');
const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load brands.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({ message: 'Brand name is required.' });
    }

    const existing = await Brand.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, 'i')
    });

    if (existing) {
      return res.json(existing);
    }

    const brand = await Brand.create({ name });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create brand.' });
  }
});

module.exports = router;
