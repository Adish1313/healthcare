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
const nodemailer = require('nodemailer');

// POST /api/video-call/start
router.post('/start', async (req, res) => {
  try {
    const { email, doctorName, user_email } = req.body;
    if (!email || !doctorName || !user_email) {
      return res.status(400).json({ message: 'Missing required fields: email, doctorName, user_email' });
    }

    console.log('Request received:', {
      email, doctorName, user_email
    });

    // Check wallet balance of user's email
    const wallet = await PatientWallet.findOne({ where: { email: user_email } });
    if (!wallet) {
      console.error('Wallet not found for user:', user_email);
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < VIDEO_CALL_FEE) {
      console.error('Insufficient balance:', {
        required: VIDEO_CALL_FEE,
        current: wallet.balance
      });
      return res.status(400).json({ 
        message: 'Insufficient balance',
        requiredBalance: VIDEO_CALL_FEE,
        currentBalance: wallet.balance
      });
    }

    // Generate unique room ID
    const roomId = generateRoomId();
    const videoCallLink = `${process.env.CLIENT_URL}/video-call/${roomId}`;

    console.log('Generated video call link:', videoCallLink);

    // Process payment from user's email
    await processVideoCallPayment(user_email, doctorName, VIDEO_CALL_FEE);

    // Send email to doctor's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,  // This is the doctor's email
      subject: 'Video Call Link for Appointment',
      html: `Dear Doctor ${doctorName},<br><br>You have a video call scheduled. Please find the video call link below:<br>${videoCallLink}<br>`
    };

    console.log('Sending email to:', email);

    // Send email using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail(mailOptions);

    return res.json({ 
      success: true,
      message: 'Video call booked successfully',
      link: videoCallLink
    });
  } catch (error) {
    console.error('Video call booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to book video call'
    });
  }
});

// GET /api/video-call/fee
router.get('/fee', (req, res) => {
  res.json({ fee: VIDEO_CALL_FEE });
});

module.exports = router;