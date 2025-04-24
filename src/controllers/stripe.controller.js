const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PatientWallet = require('../models/patientWallet.model');
const StripePayment = require('../models/stripePayment.model');
const Transaction = require('../wallet/transaction.model');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async createCheckoutSession(req, res) {
    try {
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
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        customer_email: email,
        metadata: { email, amount }
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error('Error in createCheckoutSession:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  },

  async getPaymentHistory(req, res) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Get all Stripe payments for this patient
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
      console.error('Error fetching payment history:', error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  },
  
  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Store the Stripe event in our database regardless of type
      await StripePayment.create({
        stripe_event_id: event.id,
        stripe_object_id: event.data.object.id,
        event_type: event.type,
        amount: event.data.object.amount_total ? event.data.object.amount_total / 100 : 
               (event.data.object.amount ? event.data.object.amount / 100 : 0),
        currency: event.data.object.currency || 'usd',
        status: event.data.object.status || 'succeeded',
        customer_email: event.data.object.customer_email || 
                      (event.data.object.metadata ? event.data.object.metadata.email : null),
        patient_email: event.data.object.metadata ? event.data.object.metadata.email : null,
        metadata: event.data.object.metadata || {},
        rawData: JSON.stringify(event)
      });

      // Handle specific event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const email = session.metadata.email;
          const amount = parseFloat(session.metadata.amount);
          
          // Find or create the patient wallet
          let wallet = await PatientWallet.findOne({ where: { email } });
          if (!wallet) {
            wallet = await PatientWallet.create({
              email,
              balance: 0,
              transactions: []
            });
          }

          // Update wallet balance
          const newBalance = parseFloat(wallet.balance) + amount;
          wallet.balance = newBalance;
          
          // Add transaction to wallet's transaction array
          const transactions = wallet.transactions;
          transactions.push({
            id: uuidv4(),
            type: 'credit',
            amount,
            description: 'Stripe wallet top-up',
            time: new Date().toISOString(),
            stripeSessionId: session.id
          });
          wallet.transactions = transactions;
          
          await wallet.save();
          
          // Create a standalone transaction record
          await Transaction.create({
            id: uuidv4(),
            type: 'credit',
            amount,
            description: 'Stripe wallet top-up via Checkout',
            senderType: 'system',
            senderId: 'stripe',
            receiverType: 'patient',
            receiverId: email,
            paymentMethod: 'stripe',
            status: 'completed',
            metadata: {
              stripeSessionId: session.id,
              stripeEventId: event.id
            }
          });
          break;
        }
        
        case 'payment_intent.succeeded': {
          const intent = event.data.object;
          // If this payment intent has customer metadata, update their wallet
          if (intent.metadata && intent.metadata.email) {
            const email = intent.metadata.email;
            const amount = intent.amount_received / 100;
            
            // Find the wallet
            const wallet = await PatientWallet.findOne({ where: { email } });
            if (wallet) {
              // Update wallet balance
              wallet.balance = parseFloat(wallet.balance) + amount;
              
              // Add transaction to wallet's transaction array
              const transactions = wallet.transactions;
              transactions.push({
                id: uuidv4(),
                type: 'credit',
                amount,
                description: 'Stripe payment',
                time: new Date().toISOString(),
                stripePaymentIntentId: intent.id
              });
              wallet.transactions = transactions;
              
              await wallet.save();
            }
            
            // Create a standalone transaction record
            await Transaction.create({
              id: uuidv4(),
              type: 'credit',
              amount,
              description: 'Stripe payment via PaymentIntent',
              senderType: 'system',
              senderId: 'stripe',
              receiverType: 'patient',
              receiverId: email,
              paymentMethod: 'stripe',
              status: 'completed',
              metadata: {
                stripePaymentIntentId: intent.id,
                stripeEventId: event.id
              }
            });
          }
          break;
        }
        
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Still return 200 to Stripe so they don't retry
      res.status(200).json({ 
        received: true, 
        error: error.message,
        note: 'Webhook received but error processing. Event will not be retried.'
      });
    }
  }
};