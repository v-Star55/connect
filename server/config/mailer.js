import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config();

export const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // use STARTTLS on port 587
    requireTLS: true,
    auth: {
        user: process.env.BREVO_LOGIN,
        pass: process.env.BREVO_SMTP_KEY,
    },
});

// optional check
if (process.env.NODE_ENV !== 'test') {
    transporter.verify((error, success) => {
        if (error) console.log("Mailer Error:", error);
        else console.log("Mailer is ready to send emails!");
    });
}

