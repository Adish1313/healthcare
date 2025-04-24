const express = require('express');
const router = express.Router();
const controller = require('../controllers/stripe.controller');

router.post('/create-checkout-session', controller.createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), controller.webhook);
router.get('/payment-history', controller.getPaymentHistory);

module.exports = router;