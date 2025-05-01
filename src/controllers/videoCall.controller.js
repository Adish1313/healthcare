const { Patient, Doctor } = require('../models');
const sequelize = require('../config/database');
const PatientWallet = require('../models/patientWallet.model');
const DoctorWallet = require('../models/doctorWallet.model');
const config = require('../config/config'); // Assuming you have a config file

// Constants
const VIDEO_CALL_FEE = config.VIDEO_CALL_FEE || 500; // Default to 500 if not configured

// Get patient by ID with wallet
async function getPatientById(patientId) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) return null;
  
  // Get the patient's wallet
  const wallet = await PatientWallet.findOne({ where: { email: patient.email } });
  if (wallet) {
    patient.wallet = wallet;
  }
  
  return patient;
}

// Get doctor by ID with wallet
async function getDoctorById(doctorId) {
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) return null;
  
  // Get the doctor's wallet
  const wallet = await DoctorWallet.findOne({ where: { doctorId } });
  if (wallet) {
    doctor.wallet = wallet;
  }
  
  return doctor;
}

// Process video call payment
async function processVideoCallPayment(patientId, doctorId, amount) {
  // Use a transaction to ensure both operations succeed or fail together
  const t = await sequelize.transaction();
  
  try {
    // Get patient with wallet
    const patient = await getPatientById(patientId);
    if (!patient || !patient.wallet) {
      throw new Error('Patient or patient wallet not found');
    }
    
    // Check sufficient balance
    if (patient.wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Get doctor with wallet
    const doctor = await getDoctorById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    
    // Create doctor wallet if it doesn't exist
    let doctorWallet = doctor.wallet;
    if (!doctorWallet) {
      doctorWallet = await DoctorWallet.create({
        doctorId,
        balance: 0,
        transactions: []
      }, { transaction: t });
    }
    
    // Deduct from patient wallet
    const patientWallet = patient.wallet;
    patientWallet.balance -= amount;
    
    // Add transaction record
    const patientTransactions = patientWallet.transactions;
    patientTransactions.push({
      type: 'debit',
      amount,
      description: 'Video call with Dr. ${doctor.name}',
      timestamp: new Date()
    });
    patientWallet.transactions = patientTransactions;
    
    // Credit doctor wallet
    doctorWallet.balance += amount;
    
    // Add transaction record
    const doctorTransactions = doctorWallet.transactions;
    doctorTransactions.push({
      type: 'credit',
      amount,
      description: 'Video call with patient ${patient.name || patient.email}',
      timestamp: new Date()
    });
    doctorWallet.transactions = doctorTransactions;
    
    // Save both wallets
    await patientWallet.save({ transaction: t });
    await doctorWallet.save({ transaction: t });
    
    // Commit transaction
    await t.commit();
    
    return { success: true };
  } catch (error) {
    // Rollback transaction on error
    await t.rollback();
    throw error;
  }
}

// Generate a unique room ID for video calls
function generateRoomId() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `healthoasis-${timestamp}-${randomNum}`;
}

module.exports = {
  getPatientById,
  getDoctorById,
  processVideoCallPayment,
  generateRoomId,
  VIDEO_CALL_FEE
};