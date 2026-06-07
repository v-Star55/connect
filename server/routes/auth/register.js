import bcrypt from "bcryptjs";
import User from "../../db/models/User.js";
import { sendVerificationEmail } from "../../services/sendEmail.js";


const register = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    // 1. Check for email conflict
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      // Delete unverified user to allow retry
      await User.deleteOne({ email });
    }

    // 2. Check for username conflict
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      if (existingUsername.isVerified) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      // Delete unverified user to allow retry
      await User.deleteOne({ username });
    }

    const OTP = Math.floor(100000 + Math.random() * 900000);  // Generate a random 6-digit OTP
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ 
      name, 
      username, 
      email, 
      password: hashedPassword, 
      OTP, 
      OTPExpiry: Date.now() + 5 * 60 * 1000 
    }); // OTP expires in 5 minutes

    try {
      await sendVerificationEmail(email, name, OTP);
      return res.status(201).json({ message: "Verification email sent successfully", user });
    } catch (error) {
      console.log("Email error:", error);
      // Delete user if email failed so they can try registering again
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }
  } catch (error) {
    console.error("Registration route error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default register;

