import { OAuth2Client } from "google-auth-library";
import User from "../../db/models/User.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { getCookieOptions } from "../../utils/cookieConfig.js";

const hashToken = (t) =>
  crypto.createHash("sha256").update(t).digest("hex");

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ message: "Invalid token" });
        }
        console.log(payload);
        let user = await User.findOne({ email: payload.email });
        console.log(user);

        if (!user) {
            const baseUsername = payload.email.split("@")[0];
        

            user = await User.create({
                name: payload.given_name,
                email: payload.email,
                username: baseUsername,
                profilePicture: payload.picture,
                isGoogleUser: true,
                googleId: payload.sub,
                isVerified: true,
            });
            // User.create already saves the user
        }

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
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

};


export default googleLogin;
