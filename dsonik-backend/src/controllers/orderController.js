const Order = require('../models/Order');
const Cart = require('../models/Cart');
const PDFDocument = require('pdfkit');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, couponId } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart empty' });

    const total = cart.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const order = await Order.create({
      user: req.user.id,
      products: cart.items,
      shippingAddress,
      billingAddress,
      totalAmount: total,
      tax: 0,
      discount: 0,
      coupon: couponId || null,
      paymentMethod,
      paymentStatus: paymentMethod === 'ONLINE' ? 'Pending' : 'Pending'
    });

    // optionally clear cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product');
    if (!order) return res.status(404).json({ message: 'Not found' });
    // basic access control: user or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const o = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    res.json(o);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).populate('user').populate('products.product');
    if (!order) return res.status(404).json({ message: 'Not found' });

    // create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${order.createdAt.toISOString()}`);
    if (order.user) doc.text(`Customer: ${order.user.name} <${order.user.email}>`);
    doc.moveDown();

    doc.text('Items:');
    order.products.forEach(p => {
      doc.text(`${p.name} — ${p.quantity} x ₹${p.price} = ₹${p.quantity * p.price}`);
    });
    doc.moveDown();
    doc.text(`Total: ₹${order.totalAmount}`, { align: 'right' });

    doc.end();
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
