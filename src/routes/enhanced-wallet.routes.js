const express = require('express');
const router = express.Router();
const enhancedWalletController = require('../wallet/enhanced-wallet.controller');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Middleware to validate request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Patient wallet routes
router.post('/login', 
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  enhancedWalletController.login
);

router.get('/balance', 
  [query('email').isEmail().withMessage('Valid email is required')],
  validate,
  enhancedWalletController.getWalletBalance
);

router.post('/add-money', 
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1')
  ],
  validate,
  enhancedWalletController.addMoney
);

router.post('/book', 
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('doctorId').isInt().withMessage('Valid doctor ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1')
  ],
  validate,
  enhancedWalletController.bookAppointment
);

// Transaction history routes
router.get('/patient-history', 
  [
    query('email').isEmail().withMessage('Valid email is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  enhancedWalletController.getPatientHistory
);

router.get('/doctor-history', 
  [
    query('doctorId').isInt().withMessage('Valid doctor ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  enhancedWalletController.getDoctorHistory
);

router.get('/admin-history', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  enhancedWalletController.getAdminHistory
);

// Funds transfer route
router.post('/transfer', 
  [
    body('fromType').isIn(['patient', 'doctor', 'admin']).withMessage('fromType must be patient, doctor, or admin'),
    body('fromId').notEmpty().withMessage('fromId is required'),
    body('toType').isIn(['patient', 'doctor', 'admin']).withMessage('toType must be patient, doctor, or admin'),
    body('toId').notEmpty().withMessage('toId is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  validate,
  enhancedWalletController.transferFunds
);

// Stripe integration routes
router.post('/create-payment-intent', 
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1')
  ],
  validate,
  enhancedWalletController.createPaymentIntent
);

// Stripe webhook endpoint - raw body required for signature verification
router.post('/webhook', 
  express.raw({ type: 'application/json' }), 
  enhancedWalletController.handleStripeWebhook
);

module.exports = router;
