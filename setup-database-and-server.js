require('dotenv').config();
const sequelize = require('./src/config/database');
const AdminWallet = require('./src/models/adminWallet.model');
const DoctorWallet = require('./src/models/doctorWallet.model');
const PatientWallet = require('./src/models/patientWallet.model');
const Transaction = require('./src/wallet/transaction.model');
const express = require('express');
const cors = require('cors');

// Import all models to ensure they're registered with Sequelize
require('./src/models');

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Syncing wallet tables...');
    
    // Sync wallet models
    await AdminWallet.sync({ alter: true });
    console.log('AdminWallet table synchronized');
    
    await DoctorWallet.sync({ alter: true });
    console.log('DoctorWallet table synchronized');
    
    await PatientWallet.sync({ alter: true });
    console.log('PatientWallet table synchronized');

    await Transaction.sync({ alter: true });
    console.log('Transaction table synchronized');

    // Create default admin wallet if it doesn't exist
    const adminWallet = await AdminWallet.findOne({ where: { id: 1 } });
    if (!adminWallet) {
      await AdminWallet.create({
        id: 1,
        balance: 0,
        transactions: []
      });
      console.log('Default admin wallet created');
    }

    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up database tables:', error);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // CORS Configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Middleware
  app.use(express.json());

  // Routes
  const enhancedWalletRoutes = require('./src/routes/enhanced-wallet.routes');
  app.use('/api/wallet', enhancedWalletRoutes);

  // Special handling for Stripe webhook
  app.use('/api/wallet/webhook', express.raw({ type: 'application/json' }));

  // Root route
  app.get('/', (req, res) => {
    res.json({
      message: 'Healthcare Wallet API',
      endpoints: {
        wallet: {
          login: '/api/wallet/login [POST]',
          balance: '/api/wallet/balance?email=user@example.com [GET]',
          addMoney: '/api/wallet/add-money [POST]',
          book: '/api/wallet/book [POST]',
          patientHistory: '/api/wallet/patient-history?email=user@example.com [GET]',
          doctorHistory: '/api/wallet/doctor-history?doctorId=1 [GET]',
          adminHistory: '/api/wallet/admin-history [GET]',
          transfer: '/api/wallet/transfer [POST]',
          createPaymentIntent: '/api/wallet/create-payment-intent [POST]',
          webhook: '/api/wallet/webhook [POST]'
        }
      }
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  });

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wallet API Server running on port ${PORT}`);
  });
}

async function main() {
  const dbSetupSuccess = await setupDatabase();
  if (dbSetupSuccess) {
    await startServer();
  } else {
    console.error('Database setup failed. Server not started.');
    process.exit(1);
  }
}

main();
