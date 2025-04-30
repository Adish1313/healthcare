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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate unique Jitsi room link
    const room = generateRoomId();
    const callLink = `https://meet.jit.si/${room}`;

    // Send email with the video call link
    try {
      await mailer.sendMail({
        to: email,
        subject: 'Your Video Call Link',
        html: `<p>Your video call is ready.<br>
               Click <a href="${callLink}">here</a> to join the call.</p>`
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ message: 'Failed to send email' });
    }

    return res.json({ success: true, callLink });
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
