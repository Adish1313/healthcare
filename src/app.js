// Import required packages and models
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Wallet and Stripe models
const AdminWallet = require('./models/adminWallet.model');
const DoctorWallet = require('./models/doctorWallet.model');
const PatientWallet = require('./models/patientWallet.model');
const Transaction = require('./wallet/transaction.model');
const StripePayment = require('./models/stripePayment.model');

// Import Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Import routes
const stripeRoutes = require('./routes/stripe.routes');
const checkupBenefitsRoutes = require('./routes/checkupBenefits');
const checkupPackagesRoutes = require('./routes/checkupPackages');
const labAppointmentsRoutes = require('./routes/labAppointments');
const labServicesRoutes = require('./routes/labServices');
const labTestsRoutes = require('./routes/labTests');
const packageTestsRoutes = require('./routes/packageTests');
const resultsRoutes = require('./routes/results');
const specializedProgramsRoutes = require('./routes/specializedPrograms');
const vaccinationProcessRoutes = require('./routes/vaccinationProcess');
const vaccinationServicesRoutes = require('./routes/vaccinationServices');
const vaccinesRoutes = require('./routes/vaccines');
const emergencyServicesRoutes = require('./routes/emergencyServices');
const doctorDepartmentRoutes = require('./routes/doctorDepartment');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const messageRoutes = require('./routes/messageRoutes');
const contactInfoRoutes = require('./routes/contactInfoRoutes');
const workingHoursRoutes = require('./routes/workingHoursRoutes');
const enhancedWalletRoutes = require('./routes/enhanced-wallet.routes');
const videoCallRoutes = require('./routes/videoCall.routes');

// Create express app
const app = express();
const PORT = process.env.PORT || 3000;

// Setup CORS
app.use(cors({
    origin: [
        'http://172.16.13.138:3000',
        'http://localhost:8083',
        'http://localhost:8085',
        'http://localhost:8082',
        'https://healthoasis-website.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Special handling for Stripe and wallet webhooks - MUST be before any body parser
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const stripeController = require('./controllers/stripe.controller');
  stripeController.webhook(req, res);
});
app.post('/api/wallet/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const enhancedWalletController = require('./wallet/enhanced-wallet.controller');
  enhancedWalletController.handleWebhook(req, res);
});

// Normal body parsers AFTER webhook routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup normal routes
app.use('/api/checkup-benefits', checkupBenefitsRoutes);
app.use('/api/checkup-packages', checkupPackagesRoutes);
app.use('/api/lab-appointments', labAppointmentsRoutes);
app.use('/api/lab-services', labServicesRoutes);
app.use('/api/lab-tests', labTestsRoutes);
app.use('/api/package-tests', packageTestsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/specialized-programs', specializedProgramsRoutes);
app.use('/api/vaccination-process', vaccinationProcessRoutes);
app.use('/api/vaccination-services', vaccinationServicesRoutes);
app.use('/api/vaccines', vaccinesRoutes);
app.use('/api/emergency-services', emergencyServicesRoutes);
app.use('/api/doctor-department', doctorDepartmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/working-hours', workingHoursRoutes);
app.use('/api/wallet', enhancedWalletRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/video-call', require('./routes/videoCall.routes'));
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Healthcare Management System API',
        endpoints: {
            checkupBenefits: '/api/checkup-benefits',
            checkupPackages: '/api/checkup-packages',
            labAppointments: '/api/lab-appointments',
            labServices: '/api/lab-services',
            labTests: '/api/lab-tests',
            packageTests: '/api/package-tests',
            results: '/api/results',
            specializedPrograms: '/api/specialized-programs',
            vaccinationProcess: '/api/vaccination-process',
            vaccinationServices: '/api/vaccination-services',
            vaccines: '/api/vaccines',
            emergencyServices: '/api/emergency-services',
            doctorDepartment: '/api/doctor-department',
            appointments: '/api/appointments',
            doctors: '/api/doctors',
            departments: '/api/departments',
            medicalRecords: '/api/medical-records',
            messages: '/api/messages',
            contactInfo: '/api/contact-info',
            workingHours: '/api/working-hours',
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
app.use(errorHandler);

// 🛠 Setup wallet tables before starting the server
async function setupWalletTables() {
    try {
        console.log('Setting up wallet tables...');

        await AdminWallet.sync({ alter: true });
        console.log('AdminWallet table synchronized');

        await DoctorWallet.sync({ alter: true });
        console.log('DoctorWallet table synchronized');

        await PatientWallet.sync({ alter: true });
        console.log('PatientWallet table synchronized');

        await Transaction.sync({ alter: true });
        console.log('Transaction table synchronized');

        await StripePayment.sync({ alter: true });
        console.log('StripePayment table synchronized');

        // Ensure admin wallet exists
        const adminWallet = await AdminWallet.findOne({ where: { id: 1 } });
        if (!adminWallet) {
            await AdminWallet.create({
                id: 1,
                balance: 0,
                transactions: []
            });
            console.log('Default admin wallet created');
        }

        console.log('Wallet tables setup completed successfully!');
        return true;
    } catch (error) {
        console.error('Error setting up wallet tables:', error);
        return false;
    }
}

// Database connection and server start
sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established successfully');
        return setupWalletTables();
    })
    .then(() => sequelize.sync({ force: false }))
    .then(() => {
        console.log('All database tables synchronized successfully');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running at http://0.0.0.0:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err.message);
        process.exit(1);
    });

module.exports = app;
