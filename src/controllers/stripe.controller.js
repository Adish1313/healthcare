const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const patientWallet = require('../models/patientWallet.model');

module.exports = {
  async createCheckoutSession(req, res) {
    const { email, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Wallet Top-Up',
            },
            unit_amount: amount * 100, // cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?email=${email}&amount=${amount}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { email, amount }
    });

    res.json({ url: session.url });
  },

  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.metadata.email;
      const amount = parseFloat(session.metadata.amount);
      const now = new Date().toISOString();

      let wallet = await patientWallet.getWallet(email);
      if (!wallet) {
        await patientWallet.createWallet(email);
        wallet = await patientWallet.getWallet(email);
      }

      const newBalance = parseFloat(wallet.balance) + amount;

      await patientWallet.updateWallet(email, newBalance, {
        type: 'credit',
        amount,
        description: 'Stripe wallet top-up',
        time: now
      });
    }

    res.json({ received: true });
  }
};