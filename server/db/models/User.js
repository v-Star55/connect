import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isGoogleUser: {
        type: Boolean,
        default: false, 
    },
    password: {
        type: String,
        required: function() {
            return !this.isGoogleUser;
        },
    },
    profilePicture: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    isNotificationsEnabled: {
        type: Boolean,
        default: false,
    },
    blockedUsers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
    refreshToken: {
        type: String,
        default: "",
    },
    OTP: {
        type: Number,
        default: "",
    },
    OTPExpiry: {
        type: Date,
        default: Date.now,
    },
    googleId: {
        type: String,
        default: "",
    },

    isVerified: {
        type: Boolean,
        default: false,
    }    
}, { timestamps: true });


userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
const User = mongoose.model("User", userSchema);

export default User;