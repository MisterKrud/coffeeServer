require("dotenv").config();
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

async function sendResetEmail(to, token) {
  const resetLink = `${process.env.FRONTEND_URL}reset-password?token=${token}`;

  // Gmail API requires the email to be a base64url encoded string
  const subject = "Password Reset Request";
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `From: "DSODE Cafe Orders" <${process.env.SMTP_USER}>`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${utf8Subject}`,
    "",
    `<p>You requested a password reset.</p>
     <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
     <p>If you didn’t request this, ignore this email.</p>`,
  ];
  const message = messageParts.join("\n");

  // The Gmail API expects base64url encoding
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log("Email sent successfully via Gmail API");
  } catch (error) {
    console.error("Gmail API Error:", error);
    throw error;
  }
}

module.exports = { sendResetEmail };