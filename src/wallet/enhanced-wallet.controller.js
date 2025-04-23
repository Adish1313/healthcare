const EnhancedWalletService = require('./enhanced-wallet.service');
const walletService = new EnhancedWalletService();

const enhancedWalletController = {
  // Patient wallet login with email only
  login: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    return walletService.login(email, res);
  },

  // Book appointment and process payment
  bookAppointment: async (req, res) => {
    const { email, doctorId, amount } = req.body;
    if (!email || !doctorId || !amount) {
      return res.status(400).json({ message: 'Email, doctorId, and amount are required' });
    }
    try {
      const result = await walletService.bookAppointment(email, doctorId, amount);
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
      const result = await walletService.addMoney(email, amount, paymentMethodId);
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
      const result = await walletService.createStripePaymentIntent(email, amount);
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
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Process the event
      const result = await walletService.handleStripeWebhook(event);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Webhook handling error:', error);
      return res.status(400).json({ message: error.message });
    }
  },

  // Get patient wallet history
  getPatientHistory: async (req, res) => {
    const { email, page, limit } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    try {
      const history = await walletService.getPatientHistory(
        email, 
        page ? parseInt(page) : 1, 
        limit ? parseInt(limit) : 10
      );
      return res.status(200).json(history);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Get doctor wallet history
  getDoctorHistory: async (req, res) => {
    const { doctorId, page, limit } = req.query;
    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }
    try {
      const history = await walletService.getDoctorHistory(
        doctorId, 
        page ? parseInt(page) : 1, 
        limit ? parseInt(limit) : 10
      );
      return res.status(200).json(history);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Get admin wallet history
  getAdminHistory: async (req, res) => {
    const { page, limit } = req.query;
    try {
      const history = await walletService.getAdminHistory(
        page ? parseInt(page) : 1, 
        limit ? parseInt(limit) : 10
      );
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
      const balance = await walletService.getWalletBalance(email);
      return res.status(200).json(balance);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Transfer funds between wallets
  transferFunds: async (req, res) => {
    const { fromType, fromId, toType, toId, amount, description } = req.body;
    
    if (!fromType || !fromId || !toType || !toId || !amount) {
      return res.status(400).json({ 
        message: 'fromType, fromId, toType, toId, and amount are required' 
      });
    }
    
    if (!['patient', 'doctor', 'admin'].includes(fromType) || 
        !['patient', 'doctor', 'admin'].includes(toType)) {
      return res.status(400).json({ 
        message: 'fromType and toType must be one of: patient, doctor, admin' 
      });
    }
    
    try {
      const result = await walletService.transferFunds(
        fromType, 
        fromId, 
        toType, 
        toId, 
        parseFloat(amount), 
        description
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

module.exports = enhancedWalletController;