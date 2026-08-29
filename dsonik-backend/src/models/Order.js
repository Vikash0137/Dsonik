const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number,
  sku: String
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [orderItemSchema],
  shippingAddress: {},
  billingAddress: {},
  totalAmount: Number,
  tax: Number,
  discount: Number,
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  trackingDetails: {},
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
