const nodemailer = require('nodemailer');

// Configure your SMTP transporter here
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your email service
  auth: {
    user: process.env.EMAIL_USER, // Set in your .env
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

module.exports = { sendMail };