const { body, validationResult } = require('express-validator');

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

exports.registerRules = [
  body('name').isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  exports.handleValidation
];

exports.loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  exports.handleValidation
];

exports.productRules = [
  body('name').isString().notEmpty(),
  body('slug').isString().notEmpty(),
  body('price').optional().isNumeric(),
  exports.handleValidation
];

exports.categoryRules = [
  body('name').isString().notEmpty(),
  body('slug').isString().notEmpty(),
  exports.handleValidation
];
