const AdminWallet = require('../models/adminWallet.model');
const DoctorWallet = require('../models/doctorWallet.model');
const PatientWallet = require('../models/patientWallet.model');
const Transaction = require('./transaction.model');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51RF8S1PDMCfPLiP4EiQhKcxzF0CHI2eDuU4clkFCbb5l8PRZ2gJOAASfpInq6t9rlzoOyQYuEOGPuVLVFbbB801V009iKITh4a');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class EnhancedWalletService {
  constructor() {
    this.patientWallet = PatientWallet;
    this.doctorWallet = DoctorWallet;
    this.adminWallet = AdminWallet;
    this.transaction = Transaction;
  }

  async login(email, res) {
    try {
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find patient wallet or create if it doesn't exist
      let [patient, created] = await this.patientWallet.findOrCreate({ 
        where: { email },
        defaults: {
          balance: 0,
          transactions: []
        }
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { email: patient.email, type: 'patient' },
        process.env.JWT_SECRET || 'health-oasis-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: created ? 'Wallet created and login successful' : 'Login successful',
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
    const transaction = await sequelize.transaction();
    
    try {
      const patient = await this.patientWallet.findOne({ 
        where: { email },
        transaction
      });
      
      if (!patient) {
        await transaction.rollback();
        throw new Error('Patient not found');
      }
      
      if (patient.balance < amount) {
        await transaction.rollback();
        throw new Error('Insufficient balance');
      }

      const adminShare = amount * 0.3;
      const doctorShare = amount * 0.7;

      // Create transaction record
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Update patient wallet
      const patientTransactions = patient.transactions || [];
      patientTransactions.push({
        id: transactionId,
        type: 'debit',
        amount: amount,
        description: `Payment for appointment with Doctor ID: ${doctorId}`,
        timestamp: new Date().toISOString()
      });
      
      patient.transactions = patientTransactions;
      patient.balance -= amount;
      await patient.save({ transaction });

      // Record transaction in transactions table
      await this.transaction.create({
        id: transactionId,
        type: 'debit',
        amount: amount,
        description: `Payment for appointment with Doctor ID: ${doctorId}`,
        senderType: 'patient',
        senderId: email,
        receiverType: 'doctor',
        receiverId: doctorId.toString(),
        status: 'completed'
      }, { transaction });

      // Update admin wallet
      let admin = await this.adminWallet.findOne({ 
        where: { id: 1 },
        transaction
      });
      
      if (!admin) {
        admin = await this.adminWallet.create({
          id: 1,
          balance: adminShare,
          transactions: [{
            id: `${transactionId}-ADMIN`,
            type: 'credit',
            amount: adminShare,
            description: `Commission from appointment booking by ${email} with Doctor ID: ${doctorId}`,
            timestamp: new Date().toISOString()
          }]
        }, { transaction });
      } else {
        const adminTransactions = admin.transactions || [];
        adminTransactions.push({
          id: `${transactionId}-ADMIN`,
          type: 'credit',
          amount: adminShare,
          description: `Commission from appointment booking by ${email} with Doctor ID: ${doctorId}`,
          timestamp: new Date().toISOString()
        });
        
        admin.transactions = adminTransactions;
        admin.balance += adminShare;
        await admin.save({ transaction });
      }

      // Record admin transaction
      await this.transaction.create({
        id: `${transactionId}-ADMIN`,
        type: 'credit',
        amount: adminShare,
        description: `Commission from appointment booking by ${email} with Doctor ID: ${doctorId}`,
        senderType: 'patient',
        senderId: email,
        receiverType: 'admin',
        receiverId: '1',
        status: 'completed'
      }, { transaction });

      // Update doctor wallet
      let doctor = await this.doctorWallet.findOne({ 
        where: { doctorId },
        transaction
      });
      
      if (!doctor) {
        doctor = await this.doctorWallet.create({
          doctorId,
          balance: doctorShare,
          transactions: [{
            id: `${transactionId}-DOC`,
            type: 'credit',
            amount: doctorShare,
            description: `Payment received from patient ${email}`,
            timestamp: new Date().toISOString()
          }]
        }, { transaction });
      } else {
        const doctorTransactions = doctor.transactions || [];
        doctorTransactions.push({
          id: `${transactionId}-DOC`,
          type: 'credit',
          amount: doctorShare,
          description: `Payment received from patient ${email}`,
          timestamp: new Date().toISOString()
        });
        
        doctor.transactions = doctorTransactions;
        doctor.balance += doctorShare;
        await doctor.save({ transaction });
      }

      // Record doctor transaction
      await this.transaction.create({
        id: `${transactionId}-DOC`,
        type: 'credit',
        amount: doctorShare,
        description: `Payment received from patient ${email}`,
        senderType: 'patient',
        senderId: email,
        receiverType: 'doctor',
        receiverId: doctorId.toString(),
        status: 'completed'
      }, { transaction });

      await transaction.commit();

      return { 
        message: 'Transaction successful',
        transactionId,
        patientBalance: patient.balance
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Book appointment error:', error);
      throw new Error(error.message || 'Internal error');
    }
  }

  async addMoney(email, amount, paymentMethodId = null) {
    const transaction = await sequelize.transaction();
    
    try {
      let patient = await this.patientWallet.findOne({ 
        where: { email },
        transaction
      });
      
      if (!patient) {
        patient = await this.patientWallet.create({
          email,
          balance: 0,
          transactions: []
        }, { transaction });
      }

      let paymentConfirmation = null;
      
      // If payment method ID is provided, process payment through Stripe
      if (paymentMethodId) {
        paymentConfirmation = await this.processStripePayment(email, amount, paymentMethodId);
      }

      // Create transaction record
      const transactionId = paymentConfirmation?.id || `ADD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
      await patient.save({ transaction });

      // Record transaction in transactions table
      await this.transaction.create({
        id: transactionId,
        type: 'credit',
        amount: parseFloat(amount),
        description: paymentMethodId ? 'Added money via Stripe' : 'Added money to wallet',
        senderType: 'system',
        senderId: 'payment',
        receiverType: 'patient',
        receiverId: email,
        paymentMethod: paymentMethodId ? 'stripe' : 'manual',
        status: 'completed',
        metadata: paymentConfirmation ? { stripePaymentId: paymentConfirmation.id } : {}
      }, { transaction });

      await transaction.commit();

      return { 
        message: 'Money added successfully', 
        newBalance: patient.balance,
        transaction: patientTransaction
      };
    } catch (error) {
      await transaction.rollback();
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
        metadata: { email }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  async createStripePaymentIntent(email, amount) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe requires amount in cents
        currency: 'inr',
        metadata: { email },
        description: `Wallet top-up for ${email}`
      });

      return {
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        publishableKey: 'pk_test_51RF8S1PDMCfPLiP4MURblNRlBlOH1b78WafGCWw5SdZEajjSdWv38SlEci1IMPmY18Ij5V174vBoiCIwkXKTv2uO00aW2X9ymG'
      };
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw new Error(error.message || 'Payment intent creation failed');
    }
  }

  async handleStripeWebhook(event) {
    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const email = paymentIntent.metadata.email;
        const amount = paymentIntent.amount / 100; // Convert from cents

        // Add money to user's wallet
        await this.addMoney(email, amount);

        return { message: 'Payment processed successfully' };
      }
      
      return { message: 'Event processed' };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw new Error(error.message || 'Webhook processing failed');
    }
  }

  async getTransactionHistory(type, id, startDate, endDate, page = 1, limit = 10) {
    try {
      const whereClause = {};
      
      if (type === 'patient') {
        whereClause[Op.or] = [
          { senderType: 'patient', senderId: id },
          { receiverType: 'patient', receiverId: id }
        ];
      } else if (type === 'doctor') {
        whereClause[Op.or] = [
          { senderType: 'doctor', senderId: id },
          { receiverType: 'doctor', receiverId: id }
        ];
      } else if (type === 'admin') {
        whereClause[Op.or] = [
          { senderType: 'admin', senderId: id },
          { receiverType: 'admin', receiverId: id }
        ];
      }

      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const offset = (page - 1) * limit;
      
      const { count, rows } = await this.transaction.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        transactions: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Get transaction history error:', error);
      throw new Error(error.message || 'Failed to retrieve transaction history');
    }
  }

  async getPatientHistory(email, page = 1, limit = 10) {
    return this.getTransactionHistory('patient', email, null, null, page, limit);
  }

  async getDoctorHistory(doctorId, page = 1, limit = 10) {
    return this.getTransactionHistory('doctor', doctorId.toString(), null, null, page, limit);
  }

  async getAdminHistory(page = 1, limit = 10) {
    return this.getTransactionHistory('admin', '1', null, null, page, limit);
  }

  async getWalletBalance(email) {
    try {
      const patient = await this.patientWallet.findOne({ where: { email } });
      if (!patient) {
        throw new Error('Patient wallet not found');
      }
      
      return {
        email: patient.email,
        balance: patient.balance
      };
    } catch (error) {
      console.error('Get wallet balance error:', error);
      throw new Error(error.message || 'Failed to retrieve wallet balance');
    }
  }

  async transferFunds(fromType, fromId, toType, toId, amount, description) {
    const transaction = await sequelize.transaction();
    
    try {
      let fromWallet, toWallet;
      
      // Get sender wallet
      if (fromType === 'patient') {
        fromWallet = await this.patientWallet.findOne({ 
          where: { email: fromId },
          transaction
        });
      } else if (fromType === 'doctor') {
        fromWallet = await this.doctorWallet.findOne({ 
          where: { doctorId: fromId },
          transaction
        });
      } else if (fromType === 'admin') {
        fromWallet = await this.adminWallet.findOne({ 
          where: { id: fromId },
          transaction
        });
      }
      
      if (!fromWallet) {
        await transaction.rollback();
        throw new Error(`${fromType} wallet not found`);
      }
      
      if (fromWallet.balance < amount) {
        await transaction.rollback();
        throw new Error('Insufficient balance for transfer');
      }
      
      // Get receiver wallet
      if (toType === 'patient') {
        toWallet = await this.patientWallet.findOne({ 
          where: { email: toId },
          transaction
        });
        
        if (!toWallet) {
          toWallet = await this.patientWallet.create({
            email: toId,
            balance: 0,
            transactions: []
          }, { transaction });
        }
      } else if (toType === 'doctor') {
        toWallet = await this.doctorWallet.findOne({ 
          where: { doctorId: toId },
          transaction
        });
        
        if (!toWallet) {
          toWallet = await this.doctorWallet.create({
            doctorId: toId,
            balance: 0,
            transactions: []
          }, { transaction });
        }
      } else if (toType === 'admin') {
        toWallet = await this.adminWallet.findOne({ 
          where: { id: toId },
          transaction
        });
        
        if (!toWallet) {
          toWallet = await this.adminWallet.create({
            id: toId,
            balance: 0,
            transactions: []
          }, { transaction });
        }
      }
      
      // Create transaction ID
      const transactionId = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const timestamp = new Date().toISOString();
      
      // Update sender wallet
      const fromTransactions = fromWallet.transactions || [];
      fromTransactions.push({
        id: `${transactionId}-FROM`,
        type: 'debit',
        amount: amount,
        description: description || `Transfer to ${toType} ${toId}`,
        timestamp: timestamp
      });
      
      fromWallet.transactions = fromTransactions;
      fromWallet.balance -= amount;
      await fromWallet.save({ transaction });
      
      // Update receiver wallet
      const toTransactions = toWallet.transactions || [];
      toTransactions.push({
        id: `${transactionId}-TO`,
        type: 'credit',
        amount: amount,
        description: description || `Transfer from ${fromType} ${fromId}`,
        timestamp: timestamp
      });
      
      toWallet.transactions = toTransactions;
      toWallet.balance += amount;
      await toWallet.save({ transaction });
      
      // Record transaction in transactions table
      await this.transaction.create({
        id: transactionId,
        type: 'transfer',
        amount: amount,
        description: description || `Transfer from ${fromType} ${fromId} to ${toType} ${toId}`,
        senderType: fromType,
        senderId: fromId.toString(),
        receiverType: toType,
        receiverId: toId.toString(),
        status: 'completed'
      }, { transaction });
      
      await transaction.commit();
      
      return {
        message: 'Transfer successful',
        transactionId,
        fromBalance: fromWallet.balance,
        toBalance: toWallet.balance
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Transfer funds error:', error);
      throw new Error(error.message || 'Transfer failed');
    }
  }

  async autoDeductForAppointment(email, doctorId, amount, appointmentId) {
    const transaction = await sequelize.transaction();
    
    try {
      const patient = await this.patientWallet.findOne({ 
        where: { email },
        transaction
      });
      
      if (!patient) {
        await transaction.rollback();
        throw new Error('Patient wallet not found');
      }
      
      if (patient.balance < amount) {
        await transaction.rollback();
        throw new Error('Insufficient balance');
      }

      const adminShare = amount * 0.3;
      const doctorShare = amount * 0.7;

      // Create transaction record
      const transactionId = `APPT-${appointmentId}-${Date.now()}`;
      
      // Update patient wallet
      const patientTransactions = patient.transactions || [];
      patientTransactions.push({
        id: transactionId,
        type: 'debit',
        amount: amount,
        description: `Auto-payment for appointment #${appointmentId} with Doctor ID: ${doctorId}`,
        timestamp: new Date().toISOString()
      });
      
      patient.transactions = patientTransactions;
      patient.balance -= amount;
      await patient.save({ transaction });

      // Record transaction in transactions table
      await this.transaction.create({
        id: transactionId,
        type: 'debit',
        amount: amount,
        description: `Auto-payment for appointment #${appointmentId} with Doctor ID: ${doctorId}`,
        senderType: 'patient',
        senderId: email,
        receiverType: 'doctor',
        receiverId: doctorId.toString(),
        status: 'completed',
        metadata: { appointmentId }
      }, { transaction });

      // Update admin wallet
      let admin = await this.adminWallet.findOne({ 
        where: { id: 1 },
        transaction
      });
      
      if (!admin) {
        admin = await this.adminWallet.create({
          id: 1,
          balance: adminShare,
          transactions: [{
            id: `${transactionId}-ADMIN`,
            type: 'credit',
            amount: adminShare,
            description: `Commission from appointment #${appointmentId} by ${email} with Doctor ID: ${doctorId}`,
            timestamp: new Date().toISOString()
          }]
        }, { transaction });
      } else {
        const adminTransactions = admin.transactions || [];
        adminTransactions.push({
          id: `${transactionId}-ADMIN`,
          type: 'credit',
          amount: adminShare,
          description: `Commission from appointment #${appointmentId} by ${email} with Doctor ID: ${doctorId}`,
          timestamp: new Date().toISOString()
        });
        
        admin.transactions = adminTransactions;
        admin.balance += adminShare;
        await admin.save({ transaction });
      }

      // Record admin transaction
      await this.transaction.create({
        id: `${transactionId}-ADMIN`,
        type: 'credit',
        amount: adminShare,
        description: `Commission from appointment #${appointmentId} by ${email} with Doctor ID: ${doctorId}`,
        senderType: 'patient',
        senderId: email,
        receiverType: 'admin',
        receiverId: '1',
        status: 'completed',
        metadata: { appointmentId }
      }, { transaction });

      // Update doctor wallet
      let doctor = await this.doctorWallet.findOne({ 
        where: { doctorId },
        transaction
      });
      
      if (!doctor) {
        doctor = await this.doctorWallet.create({
          doctorId,
          balance: doctorShare,
          transactions: [{
            id: `${transactionId}-DOC`,
            type: 'credit',
            amount: doctorShare,
            description: `Payment received for appointment #${appointmentId} from patient ${email}`,
            timestamp: new Date().toISOString()
          }]
        }, { transaction });
      } else {
        const doctorTransactions = doctor.transactions || [];
        doctorTransactions.push({
          id: `${transactionId}-DOC`,
          type: 'credit',
          amount: doctorShare,
          description: `Payment received for appointment #${appointmentId} from patient ${email}`,
          timestamp: new Date().toISOString()
        });
        
        doctor.transactions = doctorTransactions;
        doctor.balance += doctorShare;
        await doctor.save({ transaction });
      }

      // Record doctor transaction
      await this.transaction.create({
        id: `${transactionId}-DOC`,
        type: 'credit',
        amount: doctorShare,
        description: `Payment received for appointment #${appointmentId} from patient ${email}`,
        senderType: 'patient',
        senderId: email,
        receiverType: 'doctor',
        receiverId: doctorId.toString(),
        status: 'completed',
        metadata: { appointmentId }
      }, { transaction });

      await transaction.commit();

      return { 
        message: 'Payment processed successfully',
        transactionId,
        patientBalance: patient.balance
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Auto-deduct payment error:', error);
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  async getDetailedWalletBalance(email) {
    try {
      const patient = await this.patientWallet.findOne({ where: { email } });
      
      if (!patient) {
        throw new Error('Patient wallet not found');
      }
      
      // Get recent transactions
      const recentTransactions = await this.transaction.findAll({
        where: {
          [Op.or]: [
            { senderType: 'patient', senderId: email },
            { receiverType: 'patient', receiverId: email }
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      
      return {
        email: patient.email,
        balance: patient.balance,
        recentTransactions: recentTransactions
      };
    } catch (error) {
      console.error('Get detailed wallet balance error:', error);
      throw new Error(error.message || 'Failed to retrieve wallet balance');
    }
  }
}

module.exports = EnhancedWalletService;
