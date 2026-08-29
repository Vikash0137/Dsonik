const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  companyName: String,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  message: String,
  status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Closed'], default: 'New' },
  adminNote: String
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
