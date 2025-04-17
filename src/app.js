require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const auth = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import models
require('./models');

// Import routes
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
// Removed patientRoutes — not needed anymore
const departmentRoutes = require('./routes/departmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const messageRoutes = require('./routes/messageRoutes');
const contactInfoRoutes = require('./routes/contactInfoRoutes');
const workingHoursRoutes = require('./routes/workingHoursRoutes');
// const sampleRoutes = require('./routes/Sample');

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
// Removed: app.use('/api/patients', patientRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/working-hours', workingHoursRoutes);
// app.use('/api/samples', sampleRoutes);

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
            // Removed patients
            departments: '/api/departments',
            medicalRecords: '/api/medical-records',
            messages: '/api/messages',
            contactInfo: '/api/contact-info',
            workingHours: '/api/working-hours',
            samples: '/api/samples'
        }
    });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
sequelize
    .sync({ force: false }) // true will drop tables
    .then(() => {
        console.log('Database synchronized successfully');
        app.listen(3000, '0.0.0.0', () => {
            console.log('Server running...');
          });
        // app.listen(PORT, '172.16.13.138', () => {
        //     console.log(`Server is running on http://172.16.13.138:${PORT}`);
        // });
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err.message);
        process.exit(1);
    });

module.exports = app;
