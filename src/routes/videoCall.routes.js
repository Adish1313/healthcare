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
    const { email, doctorName } = req.body;
    if (!email || !doctorName) {
      return res.status(400).json({ message: 'Missing required fields: email, doctorName' });
    }

    // Check wallet balance
    const wallet = await PatientWallet.findOne({ where: { email } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < VIDEO_CALL_FEE) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        requiredBalance: VIDEO_CALL_FEE,
        currentBalance: wallet.balance
      });
    }

    // Generate unique room ID
    const roomId = generateRoomId();
    const videoCallLink = `ttps://oasis-health-reborn.com/video-call/${roomId}`

    // Process payment
    await processVideoCallPayment(email, doctorName, VIDEO_CALL_FEE);

    // Send email with video call link
    await mailer.sendMail({
      to: email,
      subject: 'Video Call Link for Appointment',
      html: `Dear Doctor ${doctorName},<br><br>Please find your video call link below:<br>${videoCallLink}<br><br>Best regards,<br>Oasis Health Team`
    });

    return res.json({ 
      success: true,
      message: 'Video call booked successfully',
      link: videoCallLink
    });
  } catch (error) {
    console.error('Video call booking error:', error);
    res.status(500).json({ message: 'Failed to book video call' });
  }
});

// GET /api/video-call/fee
router.get('/fee', (req, res) => {
  res.json({ fee: VIDEO_CALL_FEE });
});

module.exports = router;