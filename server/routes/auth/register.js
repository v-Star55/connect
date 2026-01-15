import bcrypt from "bcryptjs";
import User from "../../db/models/User.js";
import { sendVerificationEmail } from "../../services/sendEmail.js";


const register = async (req, res) => {
  const { name, username, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const OTP = Math.floor(100000 + Math.random() * 900000);  // Generate a random 6-digit OTP
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, username, email, password: hashedPassword, OTP, OTPExpiry: Date.now() + 5 * 60 * 1000 }); // OTP expires in 5 minutes

  try {
    await sendVerificationEmail(email, name, OTP);
    res.status(201).json({ message: "Verification email sent successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to send verification email" });
  }

};

export default register;

