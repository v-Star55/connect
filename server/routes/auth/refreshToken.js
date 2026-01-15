import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import User from "../../db/models/User.js";

const hashToken = (t) =>
  crypto.createHash("sha256").update(t).digest("hex");

const refreshToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let payload;
    try {
      payload = jwt.verify(tokenFromCookie, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        console.error("Refresh error:", err);
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: "Refresh token not found" });
    }

    // Compare with DB (hashed)
    if (user.refreshToken !== hashToken(tokenFromCookie)) {
      return res.status(403).json({ message: "Refresh token mismatch" });
    }

    // Rotate refresh token
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Token refreshed" });

  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default refreshToken;
