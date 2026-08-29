const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, index: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [String],
  price: Number,
  discountPrice: Number,
  sku: String,
  stock: Number,
  shortDescription: String,
  description: String,
  specifications: {},
  features: [String],
  applications: [String],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
