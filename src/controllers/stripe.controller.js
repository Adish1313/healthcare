// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const PatientWallet = require('../models/patientWallet.model');
// const StripePayment = require('../models/stripePayment.model');
// const Transaction = require('../wallet/transaction.model');
// const { v4: uuidv4 } = require('uuid');

// module.exports = {
//   async createCheckoutSession(req, res) {
//     try {
//       const { email, amount } = req.body;
      
//       // Validate required fields
//       if (!email) {
//         return res.status(400).json({ error: 'Email is required' });
//       }
      
//       if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
//         return res.status(400).json({ error: 'Valid amount is required' });
//       }

//       console.log(`🔔 Creating checkout session for ${email} with amount ${amount}`);
      
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         mode: 'payment',
//         line_items: [
//           {
//             price_data: {
//               currency: 'usd', // or 'inr' if your project is Indian currency
//               product_data: {
//                 name: 'Wallet Top-Up',
//                 description: `Add funds to your healthcare wallet (${email})`,
//               },
//               unit_amount: Math.round(parseFloat(amount)), // cents or paisa
//             },
//             quantity: 1,
//           },
//         ],
//         success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
//         cancel_url: `${process.env.CLIENT_URL}/cancel`,
//         customer_email: email,
//         metadata: { 
//           email: email, 
//           amount: parseFloat(amount).toFixed(2),
//           timestamp: new Date().toISOString()
//         }
//       });

//       console.log(`✅ Checkout session created: ${session.id}`);
//       res.json({ 
//         url: session.url, 
//         sessionId: session.id,
//         success: true
//       });
//     } catch (error) {
//       console.error('❌ Error in createCheckoutSession:', error);
//       res.status(500).json({ 
//         error: 'Failed to create checkout session', 
//         message: error.message,
//         success: false
//       });
//     }
//   },

//   async getPaymentHistory(req, res) {
//     try {
//       const { email } = req.query;
      
//       if (!email) {
//         return res.status(400).json({ error: 'Email is required' });
//       }
      
//       // Get all Stripe payments for this patient
//       const payments = await StripePayment.findAll({
//         where: { patient_email: email },
//         order: [['createdAt', 'DESC']]
//       });
      
//       res.json({
//         success: true,
//         payments: payments.map(payment => ({
//           id: payment.id,
//           amount: payment.amount,
//           currency: payment.currency,
//           status: payment.status,
//           date: payment.createdAt,
//           type: payment.event_type
//         }))
//       });
//     } catch (error) {
//       console.error('Error fetching payment history:', error);
//       res.status(500).json({ error: 'Failed to fetch payment history' });
//     }
//   },
  
//   async webhook(req, res) {
//     console.log('🔔 Webhook received');
//     const sig = req.headers['stripe-signature'];

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//       console.log(`✅ Webhook verified: ${event.type}`);
//     } catch (err) {
//       console.error('⚠️ Webhook signature verification failed:', err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     try {
//       // Log the event data for debugging
//       console.log(`📝 Processing event: ${event.type}`);
//       console.log('Event data:', JSON.stringify(event.data.object, null, 2));
      
//       // Store the Stripe event in our database regardless of type
//       const stripePayment = await StripePayment.create({
//         stripe_event_id: event.id,
//         stripe_object_id: event.data.object.id,
//         event_type: event.type,
//         amount: event.data.object.amount_total ? event.data.object.amount_total / 100 : 
//                (event.data.object.amount ? event.data.object.amount / 100 : 0),
//         currency: event.data.object.currency || 'usd',
//         status: event.data.object.status || 'succeeded',
//         customer_email: event.data.object.customer_email || 
//                       (event.data.object.metadata ? event.data.object.metadata.email : null),
//         patient_email: event.data.object.metadata ? event.data.object.metadata.email : null,
//         metadata: event.data.object.metadata || {},
//         rawData: JSON.stringify(event)
//       });
//       console.log(`✅ Stripe payment record created: ${stripePayment.id}`);

//       // Handle specific event types
//       switch (event.type) {
//         case 'checkout.session.completed': {
//           console.log('💰 Processing checkout.session.completed');
//           const session = event.data.object;
          
//           // Check if we have the necessary metadata
//           if (!session.metadata || !session.metadata.email) {
//             console.error('❌ Missing email in session metadata:', session.id);
//             break;
//           }
          
//           const email = session.metadata.email;
//           const amount = parseFloat(session.metadata.amount);
          
//           console.log(`📧 User email: ${email}`);
//           console.log(`💲 Amount: ${amount}`);
          
//           // Find or create the patient wallet
//           let wallet = await PatientWallet.findOne({ where: { email } });
//           if (!wallet) {
//             console.log(`🆕 Creating new wallet for user: ${email}`);
//             wallet = await PatientWallet.create({
//               email,
//               balance: 0,
//               transactions: []
//             });
//           } else {
//             console.log(`🔍 Found existing wallet for user: ${email}`);
//           }

//           // Update wallet balance
//           const oldBalance = parseFloat(wallet.balance);
//           const newBalance = oldBalance + amount;
//           wallet.balance = newBalance;
//           console.log(`💹 Updating balance: ${oldBalance} + ${amount} = ${newBalance}`);
          
//           // Add transaction to wallet's transaction array
//           const transactions = wallet.transactions;
//           const transactionId = uuidv4();
//           transactions.push({
//             id: transactionId,
//             type: 'credit',
//             amount,
//             description: 'Stripe wallet top-up',
//             time: new Date().toISOString(),
//             stripeSessionId: session.id
//           });
//           wallet.transactions = transactions;
          
//           await wallet.save();
//           console.log(`✅ Wallet updated successfully: ${email}`);
          
//           // Create a standalone transaction record
//           const transaction = await Transaction.create({
//             id: transactionId,
//             type: 'credit',
//             amount,
//             description: 'Stripe wallet top-up via Checkout',
//             senderType: 'system',
//             senderId: 'stripe',
//             receiverType: 'patient',
//             receiverId: email,
//             paymentMethod: 'stripe',
//             status: 'completed',
//             metadata: {
//               stripeSessionId: session.id,
//               stripeEventId: event.id
//             }
//           });
//           console.log(`✅ Transaction record created: ${transaction.id}`);
//           break;
//         }
        
//         case 'payment_intent.succeeded': {
//           console.log('💰 Processing payment_intent.succeeded');
//           const intent = event.data.object;
          
//           // Check if we have the necessary metadata
//           if (!intent.metadata || !intent.metadata.email) {
//             console.error('❌ Missing email in payment intent metadata:', intent.id);
//             break;
//           }
          
//           const email = intent.metadata.email;
//           const amount = intent.amount_received / 100;
          
//           console.log(`📧 User email: ${email}`);
//           console.log(`💲 Amount: ${amount}`);
          
//           // Find the wallet
//           const wallet = await PatientWallet.findOne({ where: { email } });
//           if (!wallet) {
//             console.error(`❌ No wallet found for user: ${email}`);
//             // Create a wallet if it doesn't exist
//             const newWallet = await PatientWallet.create({
//               email,
//               balance: amount,
//               transactions: [{
//                 id: uuidv4(),
//                 type: 'credit',
//                 amount,
//                 description: 'Stripe payment',
//                 time: new Date().toISOString(),
//                 stripePaymentIntentId: intent.id
//               }]
//             });
//             console.log(`🆕 Created new wallet for user: ${email} with balance: ${amount}`);
//           } else {
//             console.log(`🔍 Found existing wallet for user: ${email}`);
//             // Update wallet balance
//             const oldBalance = parseFloat(wallet.balance);
//             const newBalance = oldBalance + amount;
//             wallet.balance = newBalance;
//             console.log(`💹 Updating balance: ${oldBalance} + ${amount} = ${newBalance}`);
            
//             // Add transaction to wallet's transaction array
//             const transactions = wallet.transactions;
//             transactions.push({
//               id: uuidv4(),
//               type: 'credit',
//               amount,
//               description: 'Stripe payment',
//               time: new Date().toISOString(),
//               stripePaymentIntentId: intent.id
//             });
//             wallet.transactions = transactions;
            
//             await wallet.save();
//             console.log(`✅ Wallet updated successfully: ${email}`);
//           }
          
//           // Create a standalone transaction record
//           const transactionId = uuidv4();
//           const transaction = await Transaction.create({
//             id: transactionId,
//             type: 'credit',
//             amount,
//             description: 'Stripe payment via PaymentIntent',
//             senderType: 'system',
//             senderId: 'stripe',
//             receiverType: 'patient',
//             receiverId: email,
//             paymentMethod: 'stripe',
//             status: 'completed',
//             metadata: {
//               stripePaymentIntentId: intent.id,
//               stripeEventId: event.id
//             }
//           });
//           console.log(`✅ Transaction record created: ${transaction.id}`);
//           break;
//         }
        
//         default:
//           console.log(`ℹ️ Unhandled event type ${event.type}`);
//       }
      
//       console.log('✅ Webhook processing completed successfully');
//       res.json({ received: true, success: true });
//     } catch (error) {
//       console.error('❌ Error processing webhook:', error);
//       // Log the full error stack for debugging
//       console.error(error.stack);
      
//       // Still return 200 to Stripe so they don't retry
//       res.status(200).json({ 
//         received: true, 
//         success: false,
//         error: error.message,
//         note: 'Webhook received but error processing. Event will not be retried.'
//       });
//     }
//   }
// };
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

      console.log(`🔔 Creating checkout session for ${email} with amount $${amount}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Wallet Top-Up',
                description: `Top-up wallet for ${email}`
              },
              unit_amount: Math.round(parseFloat(amount)), // cents (important fix)
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

      console.log(`✅ Checkout session created: ${session.id}`);
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
      console.log(`✅ Webhook verified: ${event.type}`);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      console.log(`📝 Processing event: ${event.type}`);
      console.log('Event Data:', JSON.stringify(event.data.object, null, 2));

      const { object } = event.data;

      // Always store Stripe payment events, handle duplicates gracefully
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
          console.log(`✅ Stripe payment record inserted:`, paymentRecord.id);
        } else {
          console.log(`ℹ️ Stripe payment event already exists (duplicate event):`, paymentRecord.id);
        }
      } catch (dbError) {
        console.error('❌ Error inserting StripePayment record:', dbError);
        if (dbError.errors) {
          dbError.errors.forEach(e => console.error('Sequelize error:', e.message));
        }
      }

      // Specific event handlers
      if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const metadata = object.metadata || {};
        const email = metadata.email;
        const amount = event.type === 'checkout.session.completed'
          ? parseFloat(metadata.amount)
          : (object.amount_received ? object.amount_received / 100 : 0);

        if (!email) {
          console.error('❌ Missing email in metadata.');
          return res.status(200).json({ received: true, note: 'Missing email in metadata.' });
        }

        console.log(`📧 User email: ${email}`);
        console.log(`💲 Amount credited: ${amount}`);

        // Find or create wallet
        let wallet = await PatientWallet.findOne({ where: { email } });
        if (!wallet) {
          wallet = await PatientWallet.create({ email, balance: 0, transactions: [] });
          console.log(`🆕 Wallet created for ${email}`);
        }

        const oldBalance = parseFloat(wallet.balance || 0);
        const newBalance = oldBalance + amount;
        const transactionId = uuidv4();

        // Safely add new transaction
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

        // Update wallet
        wallet.balance = newBalance;
        wallet.transactions = updatedTransactions;
        await wallet.save();
        console.log(`✅ Wallet updated: New balance $${newBalance}`);

        // Create separate Transaction record
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
        console.log(`✅ Transaction record created`);
      } else {
        console.log(`ℹ️ No action needed for event type: ${event.type}`);
      }

      res.status(200).json({ received: true, success: true });

    } catch (error) {
      console.error('❌ Error handling webhook:', error.stack);
      res.status(500).json({ received: true, success: false, error: error.message });
    }
  }
};
