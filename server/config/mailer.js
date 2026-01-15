import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
  secure: true, // ensure SSL/TL
});

// optional check
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error, success) => {
    if (error) console.log("Mailer Error:", error);
    else console.log("Mailer is ready to send emails!");
  });
}

