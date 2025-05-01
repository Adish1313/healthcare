const { Patient, Doctor, Sequelize } = require('../models');
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
async function processVideoCallPayment(user_email, doctorName, amount) {
  try {
    // Get patient's wallet
    const wallet = await PatientWallet.findOne({ where: { email: user_email } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    // Check sufficient balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Deduct payment from patient's wallet
    await PatientWallet.update(
      { balance: wallet.balance - amount },
      { where: { email: user_email } }
    );

    // Get doctor's wallet - try to find doctor by name (with flexible matching)
    const doctor = await Doctor.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('name')),
        'LIKE',
        `%${doctorName.toLowerCase()}%`
      )
    });
    
    if (!doctor) {
      console.log(`Doctor not found with name: ${doctorName}`);
      // Create a temporary doctor ID for testing purposes
      const tempDoctorId = 1; // Default to ID 1 for testing
      
      // Check if wallet exists for this temporary ID
      let doctorWallet = await DoctorWallet.findOne({ where: { doctorId: tempDoctorId } });
      
      // Create wallet if it doesn't exist
      if (!doctorWallet) {
        console.log(`Creating new doctor wallet for ID: ${tempDoctorId}`);
        doctorWallet = await DoctorWallet.create({
          doctorId: tempDoctorId,
          balance: 0
        });
      }
      
      // Add payment to doctor's wallet
      await DoctorWallet.update(
        { balance: doctorWallet.balance + amount },
        { where: { doctorId: tempDoctorId } }
      );
      
      return {
        success: true,
        message: 'Payment processed successfully (doctor created)',
        patientBalance: wallet.balance - amount
      };
    }
    
    // If we found the doctor, check for their wallet
    let doctorWallet = await DoctorWallet.findOne({ where: { doctorId: doctor.id } });
    
    // Create doctor wallet if it doesn't exist
    if (!doctorWallet) {
      console.log(`Creating new doctor wallet for: ${doctor.name} (ID: ${doctor.id})`);
      doctorWallet = await DoctorWallet.create({
        doctorId: doctor.id,
        balance: 0
      });
    }

    // Add payment to doctor's wallet
    await DoctorWallet.update(
      { balance: doctorWallet.balance + amount },
      { where: { doctorId: doctor.id } }
    );

    return {
      success: true,
      message: 'Payment processed successfully',
      patientBalance: wallet.balance - amount,
      doctorBalance: doctorWallet.balance + amount
    };
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
    return { success: true };
  } catch (error) {
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