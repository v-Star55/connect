import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },

  appStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalActiveDays: { type: Number, default: 0 },

  chatStreaks: { type: Map, of: Number, default: new Map() }, // userId -> days
  chatStreakDates: { type: Map, of: Date, default: new Map() }, // userId -> last interaction date

  streakPoints: { type: Number, default: 0 },

  vibe: { type: Array, default: [] },

  challenges: { type: Array, default: [] },

  messageSent: { type: Number, default: 0 },

  badges: { type: Array, default: [] },

  currentTitle: { type: String, default: "" },
}, { timestamps: true });

const UserStats = mongoose.model("UserStats", userStatsSchema);

export default UserStats;



