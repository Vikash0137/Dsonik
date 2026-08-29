const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const ctrl = require('../../controllers/categoryController');
const validators = require('../../middleware/validators');

router.post('/', auth, admin, validators.categoryRules, ctrl.createCategory);
router.put('/:id', auth, admin, validators.categoryRules, ctrl.updateCategory);
router.delete('/:id', auth, admin, ctrl.deleteCategory);
router.get('/', auth, admin, ctrl.listCategories);
router.get('/:id', auth, admin, ctrl.getCategory);

module.exports = router;
