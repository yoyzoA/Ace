const mongoose = require('mongoose');

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, default: '', trim: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    specs: { type: [specSchema], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
