import User from "../../db/models/User.js";
import { sendForgotPasswordEmail } from "../../services/sendEmail.js";

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const OTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    user.OTP = OTP;
    user.OTPExpiry = OTPExpiry;
    await user.save();

    await sendForgotPasswordEmail(user.email, user.name, OTP);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default forgotPassword;
