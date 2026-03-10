const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetEmail(to, token) {
  //use vercel url - det rejects other domain
  const resetLink = `https://https://coffee-orders-five.vercel.app/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Cafe Orders <password-reset@dsode.cafe>",
    to: to,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `
  });
}

module.exports = { sendResetEmail };