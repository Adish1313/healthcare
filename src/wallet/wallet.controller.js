const WalletService = require('./wallet.service');

// Create wallet controller with all required functionality
const walletController = {
  // Patient wallet login with email only
  login: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    return new WalletService().login(email, res);
  },

  // Book appointment and process payment
  bookAppointment: async (req, res) => {
    const { email, doctorId, amount } = req.body;
    if (!email || !doctorId || !amount) {
      return res.status(400).json({ message: 'Email, doctorId, and amount are required' });
    }
    try {
      const result = await new WalletService().bookAppointment(email, doctorId, amount);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Add money to patient wallet
  addMoney: async (req, res) => {
    const { email, amount, paymentMethodId } = req.body;
    if (!email || !amount) {
      return res.status(400).json({ message: 'Email and amount are required' });
    }
    try {
      const result = await new WalletService().addMoney(email, amount, paymentMethodId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Create Stripe payment intent for client-side payment
  createPaymentIntent: async (req, res) => {
    const { email, amount } = req.body;
    if (!email || !amount) {
      return res.status(400).json({ message: 'Email and amount are required' });
    }
    try {
      const result = await new WalletService().createStripePaymentIntent(email, amount);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Handle Stripe webhook events
  handleStripeWebhook: async (req, res) => {
    try {
      // Verify webhook signature
      const signature = req.headers['stripe-signature'];
      const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret';
      
      let event;
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key');
        event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Process the event
      const result = await new WalletService().handleStripeWebhook(event);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Webhook handling error:', error);
      return res.status(400).json({ message: error.message });
    }
  },

  // Get patient wallet history
  getPatientHistory: async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    try {
      const history = await new WalletService().getPatientHistory(email);
      return res.status(200).json(history);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Get doctor wallet history
  getDoctorHistory: async (req, res) => {
    const { doctorId } = req.query;
    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }
    try {
      const history = await new WalletService().getDoctorHistory(doctorId);
      return res.status(200).json(history);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Get admin wallet history
  getAdminHistory: async (req, res) => {
    try {
      const history = await new WalletService().getAdminHistory();
      return res.status(200).json(history);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Get patient wallet balance
  getWalletBalance: async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    try {
      const balance = await new WalletService().getWalletBalance(email);
      return res.status(200).json(balance);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

module.exports = walletController;