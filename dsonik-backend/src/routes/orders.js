const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const ctrl = require('../controllers/orderController');

router.post('/', auth, ctrl.createOrder);
router.get('/my-orders', auth, ctrl.getMyOrders);
router.get('/:id', auth, ctrl.getOrder);

// admin
router.get('/', auth, admin, ctrl.listOrdersAdmin);
router.get('/:id/invoice', auth, admin, ctrl.generateInvoice);
router.put('/:id/status', auth, admin, ctrl.updateOrderStatus);

module.exports = router;
