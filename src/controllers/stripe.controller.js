const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PatientWallet = require('../models/patientWallet.model');
const StripePayment = require('../models/stripePayment.model');
const Transaction = require('../wallet/transaction.model');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async createCheckoutSession(req, res) {
    try {
      const { email, amount } = req.body;

      if (!email) return res.status(400).json({ error: 'Email is required' });
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }

      console.log('Creating checkout session for ${email} with amount ₹${amount}');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Wallet Top-Up',
                description: `Top-up wallet for ${email}`,
              },
              unit_amount: Math.round(parseFloat(amount) * 100),
            },
            quantity: 1
          }
        ],
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        customer_email: email,
        metadata: {
          email,
          amount: parseFloat(amount).toFixed(2),
          timestamp: new Date().toISOString()
        },
        payment_intent_data: {
          metadata: {
            email,
            amount: parseFloat(amount).toFixed(2),
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('✅ Checkout session created: ${session.id}');
      res.json({ url: session.url, sessionId: session.id, success: true });

    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session', message: error.message, success: false });
    }
  },

  async getPaymentHistory(req, res) {
    try {
      const { email } = req.query;

      if (!email) return res.status(400).json({ error: 'Email is required' });

      const payments = await StripePayment.findAll({
        where: { patient_email: email },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          date: payment.createdAt,
          type: payment.event_type
        }))
      });
    } catch (error) {
      console.error('❌ Error fetching payment history:', error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  },

  async webhook(req, res) {
    console.log('🔔 Webhook received');

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log('✅ Webhook verified: ${event.type}');
    } catch (err) {
      console.error('⚠ Webhook signature verification failed:', err.message);
      return res.status(400).send('Webhook Error: ${err.message}');
    }

    try {
      console.log('📝 Processing event: ${event.type}');
      console.log('Event Data:', JSON.stringify(event.data.object, null, 2));

      const { object } = event.data;

      // Store the payment event (ignore duplicates)
      let paymentRecord;
      try {
        [paymentRecord, created] = await StripePayment.findOrCreate({
          where: { stripe_event_id: event.id },
          defaults: {
            stripe_object_id: object.id,
            event_type: event.type,
            amount: object.amount_total ? object.amount_total / 100 : (object.amount ? object.amount / 100 : 0),
            currency: object.currency || 'usd',
            status: object.status || 'succeeded',
            customer_email: object.customer_email || object.metadata?.email || null,
            patient_email: object.metadata?.email || null,
            metadata: object.metadata || {},
            rawData: JSON.stringify(event)
          }
        });
        if (created) {
          console.log('✅ Stripe payment record inserted: ${paymentRecord.id}');
        } else {
          console.log('ℹ Stripe payment event already exists (duplicate): ${paymentRecord.id}');
        }
      } catch (dbError) {
        console.error('❌ Error inserting StripePayment record:', dbError);
        if (dbError.errors) {
          dbError.errors.forEach(e => console.error('Sequelize error:', e.message));
        }
      }

      if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const metadata = object.metadata || {};
        const email = metadata.email;
        const amount = object.amount_total
          ? object.amount_total / 100
          : (object.amount_received ? object.amount_received / 100 : 0);

        if (!email) {
          console.error('❌ Missing email in metadata.');
          return res.status(200).json({ received: true, note: 'Missing email in metadata.' });
        }

        console.log('📧 User email: ${email}');
        console.log('💲 Amount credited: ${amount}');

        // Update or create wallet
        let wallet = await PatientWallet.findOne({ where: { email } });
        if (!wallet) {
          wallet = await PatientWallet.create({ email, balance: 0, transactions: [] });
          console.log('🆕 Wallet created for ${email}');
        }

        const oldBalance = parseFloat(wallet.balance || 0);
        const newBalance = oldBalance + amount;
        const transactionId = uuidv4();

        const updatedTransactions = Array.isArray(wallet.transactions) ? [...wallet.transactions] : [];
        updatedTransactions.push({
          id: transactionId,
          type: 'credit',
          amount,
          description: event.type === 'checkout.session.completed'
            ? 'Stripe wallet top-up via Checkout'
            : 'Stripe payment via PaymentIntent',
          time: new Date().toISOString(),
          stripeSessionId: object.id,
          stripeEventId: event.id
        });

        wallet.balance = newBalance;
        wallet.transactions = updatedTransactions;
        await wallet.save();
        console.log('✅ Wallet updated: New balance ₹${newBalance}');

        await Transaction.create({
          id: transactionId,
          type: 'credit',
          amount,
          description: event.type === 'checkout.session.completed'
            ? 'Stripe wallet top-up via Checkout'
            : 'Stripe payment via PaymentIntent',
          senderType: 'system',
          senderId: 'stripe',
          receiverType: 'patient',
          receiverId: email,
          paymentMethod: 'stripe',
          status: 'completed',
          metadata: { stripeObjectId: object.id, stripeEventId: event.id }
        });
        console.log('✅ Transaction record created');
      } else {
        console.log('ℹ No action needed for event type: ${event.type}');
      }

      res.status(200).json({ received: true, success: true });

    } catch (error) {
      console.error('❌ Error handling webhook:', error.stack);
      res.status(500).json({ received: true, success: false, error: error.message });
    }
  },

  // ✅ NEW FUNCTION: Login or Check Wallet
  async loginOrCheckWallet(req, res) {
    try {
      const { email, checkOnly } = req.body;
      if (!email) return res.status(400).json({ message: 'Email is required' });

      let wallet = await PatientWallet.findOne({ where: { email } });

      if (!wallet) {
        if (checkOnly) {
          return res.status(404).json({ message: 'Wallet does not exist.' });
        } else {
          wallet = await PatientWallet.create({ email, balance: 0, transactions: [] });
          console.log('🆕 Wallet created for ${email}');
        }
      }

      res.json({ wallet });
    } catch (error) {
      console.error('❌ Error in loginOrCheckWallet:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};