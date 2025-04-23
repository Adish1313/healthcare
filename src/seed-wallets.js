require('dotenv').config();
const sequelize = require('./config/database');
const AdminWallet = require('./models/adminWallet.model');
const DoctorWallet = require('./models/doctorWallet.model');
const PatientWallet = require('./models/patientWallet.model');
const Transaction = require('./wallet/transaction.model');

async function seedWallets() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Seeding wallets...');

    // Admin Wallet
    await AdminWallet.upsert({
      id: 1,
      balance: 10000,
      transactions: [
        {
          id: 'A1',
          type: 'credit',
          amount: 10000,
          description: 'Initial admin funding',
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Doctor Wallets
    await DoctorWallet.upsert({
      doctorId: 101,
      balance: 5000,
      transactions: [
        {
          id: 'D101-1',
          type: 'credit',
          amount: 5000,
          description: 'Initial doctor funding',
          timestamp: new Date().toISOString()
        }
      ]
    });
    await DoctorWallet.upsert({
      doctorId: 102,
      balance: 3000,
      transactions: [
        {
          id: 'D102-1',
          type: 'credit',
          amount: 3000,
          description: 'Initial doctor funding',
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Patient Wallets
    await PatientWallet.upsert({
      email: 'alice@example.com',
      balance: 1200,
      transactions: [
        {
          id: 'P1',
          type: 'credit',
          amount: 1200,
          description: 'Initial patient funding',
          timestamp: new Date().toISOString()
        }
      ]
    });
    await PatientWallet.upsert({
      email: 'bob@example.com',
      balance: 800,
      transactions: [
        {
          id: 'P2',
          type: 'credit',
          amount: 800,
          description: 'Initial patient funding',
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Transactions
    await Transaction.bulkCreate([
      {
        id: 'T1',
        type: 'credit',
        amount: 1200,
        description: 'Wallet top-up',
        senderType: 'system',
        senderId: 'payment',
        receiverType: 'patient',
        receiverId: 'alice@example.com',
        paymentMethod: 'manual',
        status: 'completed',
        metadata: {}
      },
      {
        id: 'T2',
        type: 'credit',
        amount: 800,
        description: 'Wallet top-up',
        senderType: 'system',
        senderId: 'payment',
        receiverType: 'patient',
        receiverId: 'bob@example.com',
        paymentMethod: 'manual',
        status: 'completed',
        metadata: {}
      },
      {
        id: 'T3',
        type: 'credit',
        amount: 5000,
        description: 'Initial doctor funding',
        senderType: 'system',
        senderId: 'payment',
        receiverType: 'doctor',
        receiverId: '101',
        paymentMethod: 'manual',
        status: 'completed',
        metadata: {}
      },
      {
        id: 'T4',
        type: 'credit',
        amount: 3000,
        description: 'Initial doctor funding',
        senderType: 'system',
        senderId: 'payment',
        receiverType: 'doctor',
        receiverId: '102',
        paymentMethod: 'manual',
        status: 'completed',
        metadata: {}
      },
      {
        id: 'T5',
        type: 'credit',
        amount: 10000,
        description: 'Initial admin funding',
        senderType: 'system',
        senderId: 'payment',
        receiverType: 'admin',
        receiverId: '1',
        paymentMethod: 'manual',
        status: 'completed',
        metadata: {}
      }
    ], { ignoreDuplicates: true });

    console.log('Dummy wallet data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding wallet data:', error);
    process.exit(1);
  }
}

seedWallets();
