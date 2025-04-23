const AdminWallet = require('../models/adminWallet.model');
const DoctorWallet = require('../models/doctorWallet.model');
const PatientWallet = require('../models/patientWallet.model');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key');

class WalletService {
  constructor() {
    this.patientWallet = PatientWallet;
    this.doctorWallet = DoctorWallet;
    this.adminWallet = AdminWallet;
  }

  async login(email, res) {
    try {
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find patient wallet or create if it doesn't exist
      let patient = await this.patientWallet.findOne({ where: { email } });
      
      if (!patient) {
        // Create a new wallet for the patient
        patient = await this.patientWallet.create({
          email,
          balance: 0,
          transactions: []
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { email: patient.email, type: 'patient' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        wallet: {
          email: patient.email,
          balance: patient.balance,
          transactions: patient.transactions
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async bookAppointment(email, doctorId, amount) {
    try {
      const patient = await this.patientWallet.findOne({ where: { email } });
      if (!patient) throw new Error('Patient not found');
      if (patient.balance < amount) throw new Error('Insufficient balance');

      const adminShare = amount * 0.3;
      const doctorShare = amount * 0.7;

      // Create transaction records
      const transactionId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      // Update patient wallet with transaction record
      const patientTransaction = {
        id: transactionId,
        type: 'debit',
        amount: amount,
        description: `Payment for appointment with Doctor ID: ${doctorId}`,
        timestamp: timestamp
      };
      
      const patientTransactions = patient.transactions || [];
      patientTransactions.push(patientTransaction);
      patient.transactions = patientTransactions;
      patient.balance -= amount;
      await patient.save();

      // Update admin wallet with transaction record
      const admin = await this.adminWallet.findOne({ where: { id: 1 } });
      if (!admin) {
        // Create admin wallet if it doesn't exist
        await this.adminWallet.create({
          id: 1,
          balance: adminShare,
          transactions: [{
            id: transactionId,
            type: 'credit',
            amount: adminShare,
            description: `Commission from appointment booking by ${email} with Doctor ID: ${doctorId}`,
            timestamp: timestamp
          }]
        });
      } else {
        const adminTransactions = admin.transactions || [];
        adminTransactions.push({
          id: transactionId,
          type: 'credit',
          amount: adminShare,
          description: `Commission from appointment booking by ${email} with Doctor ID: ${doctorId}`,
          timestamp: timestamp
        });
        admin.transactions = adminTransactions;
        admin.balance += adminShare;
        await admin.save();
      }

      // Update doctor wallet with transaction record
      const doctor = await this.doctorWallet.findOne({ where: { doctorId } });
      if (!doctor) {
        // Create doctor wallet if it doesn't exist
        await this.doctorWallet.create({
          doctorId,
          balance: doctorShare,
          transactions: [{
            id: transactionId,
            type: 'credit',
            amount: doctorShare,
            description: `Payment received from patient ${email}`,
            timestamp: timestamp
          }]
        });
      } else {
        const doctorTransactions = doctor.transactions || [];
        doctorTransactions.push({
          id: transactionId,
          type: 'credit',
          amount: doctorShare,
          description: `Payment received from patient ${email}`,
          timestamp: timestamp
        });
        doctor.transactions = doctorTransactions;
        doctor.balance += doctorShare;
        await doctor.save();
      }

      return { 
        message: 'Transaction successful',
        transactionId,
        patientBalance: patient.balance
      };
    } catch (error) {
      console.error('Book appointment error:', error);
      throw new Error(error.message || 'Internal error');
    }
  }

  async addMoney(email, amount, paymentMethodId = null) {
    try {
      const patient = await this.patientWallet.findOne({ where: { email } });
      if (!patient) throw new Error('Patient not found');

      let paymentConfirmation = null;
      
      // If payment method ID is provided, process payment through Stripe
      if (paymentMethodId) {
        paymentConfirmation = await this.processStripePayment(email, amount, paymentMethodId);
      }

      // Create transaction record
      const transactionId = paymentConfirmation?.id || Date.now().toString();
      const timestamp = new Date().toISOString();
      
      const patientTransaction = {
        id: transactionId,
        type: 'credit',
        amount: parseFloat(amount),
        description: paymentMethodId ? 'Added money via Stripe' : 'Added money to wallet',
        paymentMethod: paymentMethodId ? 'stripe' : 'manual',
        timestamp: timestamp
      };
      
      const patientTransactions = patient.transactions || [];
      patientTransactions.push(patientTransaction);
      patient.transactions = patientTransactions;
      patient.balance += parseFloat(amount);
      await patient.save();

      return { 
        message: 'Money added successfully', 
        newBalance: patient.balance,
        transaction: patientTransaction
      };
    } catch (error) {
      console.error('Add money error:', error);
      throw new Error(error.message || 'Internal server error');
    }
  }

  async processStripePayment(email, amount, paymentMethodId) {
    try {
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe requires amount in cents
        currency: 'inr',
        payment_method: paymentMethodId,
        confirm: true,
        description: `Wallet top-up for ${email}`,
        metadata: {
          email: email,
          type: 'wallet_topup'
        }
      });

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment processing failed');
      }

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  async createStripePaymentIntent(email, amount) {
    try {
      const patient = await this.patientWallet.findOne({ where: { email } });
      if (!patient) throw new Error('Patient not found');

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe requires amount in cents
        currency: 'inr',
        metadata: {
          email: email,
          type: 'wallet_topup'
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        amount: amount
      };
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }
  }

  async handleStripeWebhook(event) {
    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const email = paymentIntent.metadata.email;
        const amount = paymentIntent.amount / 100; // Convert from cents to actual currency

        // Add money to wallet
        await this.addMoney(email, amount);
        
        return { success: true, message: 'Payment processed successfully' };
      }
      
      return { success: true, message: 'Event received but not processed' };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw new Error('Webhook processing failed');
    }
  }

  async getPatientHistory(email) {
    try {
      const wallet = await this.patientWallet.findOne({ where: { email } });
      if (!wallet) throw new Error('Patient wallet not found');
      return wallet.transactions || [];
    } catch (error) {
      console.error('Get patient history error:', error);
      throw new Error('Error fetching patient history');
    }
  }

  async getDoctorHistory(doctorId) {
    try {
      const wallet = await this.doctorWallet.findOne({ where: { doctorId } });
      if (!wallet) throw new Error('Doctor wallet not found');
      return wallet.transactions || [];
    } catch (error) {
      console.error('Get doctor history error:', error);
      throw new Error('Error fetching doctor history');
    }
  }

  async getAdminHistory() {
    try {
      const wallet = await this.adminWallet.findOne({ where: { id: 1 } }); // Assuming admin id is 1
      if (!wallet) throw new Error('Admin wallet not found');
      return wallet.transactions || [];
    } catch (error) {
      console.error('Get admin history error:', error);
      throw new Error('Error fetching admin history');
    }
  }

  async getWalletBalance(email) {
    try {
      const wallet = await this.patientWallet.findOne({ where: { email } });
      if (!wallet) throw new Error('Patient wallet not found');
      return { balance: wallet.balance };
    } catch (error) {
      console.error('Get wallet balance error:', error);
      throw new Error('Error fetching wallet balance');
    }
  }
}

module.exports = WalletService;