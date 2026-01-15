import User from "../../db/models/User.js";

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const crypto = await import("node:crypto");
      const hashToken = (t) =>
        crypto.createHash("sha256").update(t).digest("hex");

      const hashed = hashToken(refreshToken);

      // Remove refresh token from DB
      await User.findOneAndUpdate(
        { refreshToken: hashed },
        { $set: { refreshToken: null } }
      );
    }

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default logout;
