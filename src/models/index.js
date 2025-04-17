const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import all models
const Doctor = require('./doctor');
const Patient = require('./patient');
const Appointment = require('./appointment');
const Department = require('./department');
const MedicalRecord = require('./medicalRecord');
const Message = require('./message');
const ContactInfo = require('./contactInfo');
const WorkingHours = require('./workingHours');
const User = require('./user');
const Sample = require('./sample');
const CheckupBenefit = require('./checkupBenefits');
const CheckupPackage = require('./checkupPackages');
const LabAppointment = require('./labAppointments');
const LabService = require('./labServices');
const LabTest = require('./labTests');
const PackageTest = require('./packageTests');
const Result = require('./results');
const SpecializedProgram = require('./specializedPrograms');
const VaccinationProcess = require('./vaccinationProcess');
const VaccinationService = require('./vaccinationServices');
const Vaccine = require('./vaccines');
const EmergencyService = require('./emergencyServices');
const DoctorDepartment = require('./doctorDepartment');

// Define associations
const initializeAssociations = () => {
    // Doctor-Department (many-to-many)
    Doctor.belongsToMany(Department, {
        through: DoctorDepartment,
        foreignKey: 'doctor_id',
        otherKey: 'department_id',
    });
    Department.belongsToMany(Doctor, {
        through: DoctorDepartment,
        foreignKey: 'department_id',
        otherKey: 'doctor_id',
    });
    DoctorDepartment.belongsTo(Doctor, { foreignKey: 'doctor_id' });
    DoctorDepartment.belongsTo(Department, { foreignKey: 'department_id' });

    // Appointment
    Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });
    Doctor.hasMany(Appointment, { foreignKey: 'doctor_id' });    

    // Medical Record
    MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id' });
    MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id' });
    Doctor.hasMany(MedicalRecord, { foreignKey: 'doctor_id' });
    Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id' });

    // Working Hours
    WorkingHours.belongsTo(ContactInfo, { foreignKey: 'contact_info_id' });
    ContactInfo.hasMany(WorkingHours, { foreignKey: 'contact_info_id' });

    // Sample
    Sample.belongsTo(Patient, { foreignKey: 'patient_id' });
    Sample.belongsTo(Doctor, { foreignKey: 'collected_by' });
    Sample.belongsTo(LabAppointment, { foreignKey: 'lab_appointment_id' });
    Sample.hasMany(Result, { foreignKey: 'sample_id' });

    // Checkup Package
    CheckupPackage.hasMany(PackageTest, { foreignKey: 'package_id' });
    CheckupPackage.hasMany(LabAppointment, { foreignKey: 'package_id' });

    // Lab Appointment
    LabAppointment.belongsTo(User, { foreignKey: 'user_id' });
    LabAppointment.belongsTo(LabTest, { foreignKey: 'test_id' });
    LabAppointment.belongsTo(CheckupPackage, { foreignKey: 'package_id' });
    User.hasMany(LabAppointment, { foreignKey: 'user_id' });
    LabTest.hasMany(LabAppointment, { foreignKey: 'test_id' });

    // Lab Test
    LabTest.hasMany(PackageTest, { foreignKey: 'test_id' });

    // Package Test
    PackageTest.belongsTo(CheckupPackage, { foreignKey: 'package_id' });
    PackageTest.belongsTo(LabTest, { foreignKey: 'test_id' });

    // Result
    Result.belongsTo(Sample, { foreignKey: 'sample_id' });
    Result.belongsTo(User, { foreignKey: 'accessed_by_user_id' });

    // Vaccination Service & Vaccine
    VaccinationService.hasMany(Vaccine, { foreignKey: 'service_id' });
    Vaccine.belongsTo(VaccinationService, { foreignKey: 'service_id' });

    // Message
    Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
    Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });

    // NOTE: These models currently have no associations defined
    // CheckupBenefit, LabService, SpecializedProgram, VaccinationProcess, EmergencyService
};

// Initialize all associations
initializeAssociations();

module.exports = {
    sequelize,
    Sequelize,
    Doctor,
    Patient,
    Appointment,
    Department,
    MedicalRecord,
    Message,
    ContactInfo,
    WorkingHours,
    User,
    Sample,
    CheckupBenefit,
    CheckupPackage,
    LabAppointment,
    LabService,
    LabTest,
    PackageTest,
    Result,
    SpecializedProgram,
    VaccinationProcess,
    VaccinationService,
    Vaccine,
    EmergencyService,
    DoctorDepartment,
};
