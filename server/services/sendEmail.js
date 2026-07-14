import { transporter } from "../config/mailer.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the logo file
const logoPath = path.join(__dirname, "../assest/logo.png");

const getHtmlTemplate = (name, otp, title, message) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Arial', sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border-radius: 16px; border: 1px solid #333333; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 40px 0 30px 0; border-bottom: 1px solid #222222;">
                  <img src="cid:unique@logo" alt="Connect Logo" style="width: 80px; height: auto; display: block;">
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 40px;">
                  <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0;">Hello ${name},</h2>
                  <p style="color: #cccccc; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                    ${message}
                  </p>
                  
                  <!-- OTP Box -->
                  <div style="background: linear-gradient(to right, #9333ea, #db2777); padding: 2px; border-radius: 12px; margin: 30px 0;">
                    <div style="background-color: #0a0a0a; border-radius: 10px; padding: 20px; text-align: center;">
                      <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 5px; font-family: monospace;">${otp}</span>
                    </div>
                  </div>

                  <p style="color: #888888; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                    This code is valid for 5 minutes.<br>
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #111111; padding: 20px; text-align: center; border-top: 1px solid #222222;">
                  <p style="color: #666666; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} Connect. All rights reserved.
                  </p>
                  <div style="margin-top: 10px;">
                    <a href="${process.env.CLIENT_URL}" style="color: #9333ea; text-decoration: none; font-size: 12px; margin: 0 10px;">Website</a>
                    <a href="#" style="color: #9333ea; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

//  /////////////////////////////// Email Verification 

export const sendVerificationEmail = async (to, name, OTP) => {
  const html = getHtmlTemplate(
    name,
    OTP,
    "Verify Your Email",
    "Welcome to Connect! We're excited to have you on board. Please use the verification code below to complete your registration."
  );

  const mailOptions = {
    from: `Connect <${process.env.BREVO_SENDER}>`,
    to,
    subject: "Verify Your Email ✅",
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'unique@logo' // same cid value as in the html img src
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

//  /////////////////////// Passoword Reset

export const sendForgotPasswordEmail = async (to, name, OTP) => {
  const html = getHtmlTemplate(
    name,
    OTP,
    "Reset Your Password",
    "We received a request to reset your password. Use the code below to proceed. secure your account."
  );

  const mailOptions = {
    from: `Connect <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset Your Password 🔒",
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'unique@logo'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};
