require('dotenv').config();
const sequelize = require('./config/database');
const Transaction = require('./wallet/transaction.model');
const { v4: uuidv4 } = require('uuid');

async function seedDebitTransactions() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Seeding debit transactions...');

    const dummyTransactions = [
      {
        id: uuidv4(),
        type: 'debit',
        amount: 500,
        description: 'Video call payment to Dr. John Doe',
        senderType: 'patient',
        senderId: 'user1@example.com',
        receiverType: 'doctor',
        receiverId: '1',
        paymentMethod: 'wallet',
        status: 'completed',
        metadata: {
          doctorName: 'John Doe',
          transactionTime: new Date(),
          service: 'video_call'
        }
      },
      {
        id: uuidv4(),
        type: 'debit',
        amount: 1000,
        description: 'Video call payment to Dr. Jane Smith',
        senderType: 'patient',
        senderId: 'user2@example.com',
        receiverType: 'doctor',
        receiverId: '2',
        paymentMethod: 'wallet',
        status: 'completed',
        metadata: {
          doctorName: 'Jane Smith',
          transactionTime: new Date(),
          service: 'video_call'
        }
      },
      {
        id: uuidv4(),
        type: 'debit',
        amount: 750,
        description: 'Video call payment to Dr. Rahul Kumar',
        senderType: 'patient',
        senderId: 'user3@example.com',
        receiverType: 'doctor',
        receiverId: '3',
        paymentMethod: 'wallet',
        status: 'completed',
        metadata: {
          doctorName: 'Rahul Kumar',
          transactionTime: new Date(),
          service: 'video_call'
        }
      }
    ];

    for (const txn of dummyTransactions) {
      await Transaction.create(txn);
    }

    console.log('Dummy debit transactions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding debit transactions:', error);
    process.exit(1);
  }
}

seedDebitTransactions();
