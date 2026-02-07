// require("dotenv").config();
// const nodemailer = require("nodemailer");

// async function main() {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true, // true for 465
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD, // App Password
//     },
//   });

//   try {
//     const info = await transporter.sendMail({
//       from: `"Coffee App" <${process.env.EMAIL_USER}>`,
//       to: "yourtestemail@gmail.com", // put a real email you can access
//       subject: "Test Email",
//       text: "This is a test from Coffee App.",
//     });

//     console.log("Email sent:", info.response);
//   } catch (err) {
//     console.error("Email failed:", err);
//   }
// }

// main();

const nodemailer = require("nodemailer");

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  console.log(testAccount);
}

createTestAccount();

