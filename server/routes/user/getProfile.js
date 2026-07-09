import User from "../../db/models/User.js";
import UserStats from "../../db/models/userStatsSchema.js";
import Message from "../../db/models/Messages.js";
import UserConnection from "../../db/models/UserConnections.js";
import { updateAppStreak } from "../../utils/streakHelper.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check application streak on profile load (or login)
    await updateAppStreak(userId);

    const user = await User.findById(userId).select("-password -__v");
    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    // Calculate messages sent today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const messagesToday = await Message.countDocuments({
        sender: userId,
        createdAt: { $gte: startOfDay }
    });

    // Process top 3 chat streaks
    const chatStreaksMap = stats.chatStreaks || new Map();
    const sortedStreaks = Array.from(chatStreaksMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topStreaks = await Promise.all(
        sortedStreaks.map(async ([partnerId, days]) => {
            const partner = await User.findById(partnerId).select("name username profilePicture");
            return {
                user: partner,
                days
            };
        })
    );

    const totalConnections = await UserConnection.countDocuments({
        status: "accepted",
        $or: [
            { receiver: userId },
            { requester: userId }
        ]
    });

    res.json({
      user,
      stats: {
        appStreak: stats.appStreak,
        longestStreak: stats.longestStreak,
        vibe: stats.vibe,
        topChatStreaks: topStreaks,
        streakPoints: stats.streakPoints,
        totalActiveDays: stats.totalActiveDays || 0,
        messagesToday,
        connectionsCount: totalConnections
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
