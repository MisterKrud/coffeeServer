require("dotenv").config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    logger: true,
    debug: true,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'false', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetEmail(to, token) {
  const resetLink = `${process.env.FRONTEND_URL}reset-password?token=${token}`;

  const mailOptions = {
    from: `"DSODE Cafe Orders" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click this link to reset your password: ${resetLink}\n\nIf you didn’t request this, ignore this email.`,
    html: `<p>You requested a password reset.</p>
           <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
           <p>If you didn’t request this, ignore this email.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
