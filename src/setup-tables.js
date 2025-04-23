require('dotenv').config();
const sequelize = require('./config/database');
const AdminWallet = require('./models/adminWallet.model');
const DoctorWallet = require('./models/doctorWallet.model');
const PatientWallet = require('./models/patientWallet.model');

// Import all models to ensure they're registered with Sequelize
require('./models');

async function setupTables() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Syncing wallet tables...');
    
    // Sync specific wallet models
    await AdminWallet.sync({ alter: true });
    console.log('AdminWallet table synchronized');
    
    await DoctorWallet.sync({ alter: true });
    console.log('DoctorWallet table synchronized');
    
    await PatientWallet.sync({ alter: true });
    console.log('PatientWallet table synchronized');

    console.log('All wallet tables have been synchronized successfully.');
    
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
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database tables:', error);
    process.exit(1);
  }
}

setupTables();
