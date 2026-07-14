import crypto from "node:crypto";
import User from "../../db/models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getCookieOptions } from "../../utils/cookieConfig.js";

const hashToken = (t) =>
  crypto.createHash("sha256").update(t).digest("hex");

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select("+password");
    if (!user) return res.status(404).json({ message: "Create an account first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Always rotate on login
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));

    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default login;