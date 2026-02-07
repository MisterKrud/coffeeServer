require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SMTP_USER, // your Gmail address
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accessToken: async () => {
      const { token } = await oAuth2Client.getAccessToken();
      return token;
    },
  },
  logger: true,
  debug: true,
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
