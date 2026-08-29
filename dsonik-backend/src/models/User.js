const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: String,
  line1: String,
  city: String,
  state: String,
  country: String,
  zip: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [addressSchema],
  isBlocked: { type: Boolean, default: false }
  ,refreshTokens: [String]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
