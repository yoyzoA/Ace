const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    price: {
      type: Number
    },
    category: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    specs: [
      {
        label: {
          type: String,
          trim: true
        },
        value: {
          type: String,
          trim: true
        },
        _id: false
      }
    ],
    images: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Product', ProductSchema);
