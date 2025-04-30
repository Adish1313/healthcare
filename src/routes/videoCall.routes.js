const express = require('express');
const router = express.Router();
const { 
  getPatientById, 
  getDoctorById, 
  processVideoCallPayment, 
  generateRoomId, 
  VIDEO_CALL_FEE 
} = require('../controllers/videoCall.controller');
const mailer = require('../utils/mailer');

// POST /api/video-call/start
router.post('/start', async (req, res) => {
  try {
    // Input validation
    const { patientId, doctorId } = req.body;
    if (!patientId || !doctorId) {
      return res.status(400).json({ message: 'Patient ID and Doctor ID are required' });
    }

    // Validate IDs are integers
    if (!Number.isInteger(Number(patientId)) || !Number.isInteger(Number(doctorId))) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Get patient and doctor data
    const patient = await getPatientById(patientId);
    const doctor = await getDoctorById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: 'Patient or Doctor not found' });
    }

    if (!patient.wallet) {
      return res.status(404).json({ message: 'Patient wallet not found' });
    }

    if (patient.wallet.balance < VIDEO_CALL_FEE) {
      return res.status(400).json({ 
        message: 'Insufficient balance', 
        required: VIDEO_CALL_FEE, 
        current: patient.wallet.balance 
      });
    }

    // Process payment
    try {
      await processVideoCallPayment(patientId, doctorId, VIDEO_CALL_FEE);
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      return res.status(400).json({ message: paymentError.message });
    }

    // Generate unique Jitsi room link
    const room = generateRoomId();
    const callLink = `https://meet.jit.si/${room}`;

    // Store call record in database (if you have a VideoCall model)
    // const videoCall = await VideoCall.create({
    //   patientId,
    //   doctorId,
    //   roomId: room,
    //   status: 'created',
    //   amount: VIDEO_CALL_FEE,
    //   createdAt: new Date()
    // });

    // Send email to doctor with the video call link
    try {
      await mailer.sendMail({
        to: doctor.email,
        subject: 'New Video Call Request',
        html: `<p>You have a new video call request from patient <strong>${patient.email}</strong>.<br>
               Click <a href="${callLink}">here</a> to join the call.</p>`
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // We don't fail the request if email fails, just log it
    }

    // Send email to patient with the video call link
    try {
      await mailer.sendMail({
        to: patient.email,
        subject: 'Your Video Call Link',
        html: `<p>Your video call with Dr. <strong>${doctor.name || doctor.email}</strong> is ready.<br>
               Click <a href="${callLink}">here</a> to join the call.</p>`
      });
    } catch (emailError) {
      console.error('Patient email sending error:', emailError);
      // We don't fail the request if email fails, just log it
    }

    return res.json({ 
      success: true,
      callLink,
      fee: VIDEO_CALL_FEE,
      doctor: {
        name: doctor.name,
        email: doctor.email
      }
    });
  } catch (error) {
    console.error('Video call error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/video-call/fee
router.get('/fee', (req, res) => {
  res.json({ fee: VIDEO_CALL_FEE });
});

module.exports = router;
