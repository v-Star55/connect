import Chat from "../../db/models/Chat.js";
import ChatMember from "../../db/models/ChatMember.js";
import Message from "../../db/models/Messages.js";
import User from "../../db/models/User.js";
import UserConnection from "../../db/models/UserConnections.js";

export const getChatStats = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Find the other member (partner)
    const members = await ChatMember.find({ chat: chatId });
    const otherMember = members.find(m => m.user.toString() !== userId.toString());

    let partner = null;
    let friendsSince = "Not friends";

    if (otherMember) {
      partner = await User.findById(otherMember.user).select("name username bio createdAt aboutMe");
      
      const conn = await UserConnection.findOne({
        status: "accepted",
        $or: [
          { requester: userId, receiver: otherMember.user },
          { requester: otherMember.user, receiver: userId }
        ]
      });

      if (conn) {
        const since = conn.updatedAt || conn.createdAt;
        const diffMs = Date.now() - new Date(since).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) {
          friendsSince = "Just connected today";
        } else if (diffDays < 30) {
          friendsSince = `${diffDays} day${diffDays > 1 ? "s" : ""}`;
        } else if (diffDays < 365) {
          const diffMonths = Math.floor(diffDays / 30);
          friendsSince = `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
        } else {
          const diffYears = Math.floor(diffDays / 365);
          friendsSince = `${diffYears} year${diffYears > 1 ? "s" : ""}`;
        }
      }
    }

    // Calculate message statistics
    const firstMessage = await Message.findOne({ chatId }).sort({ createdAt: 1 });
    const firstMessageDate = firstMessage ? firstMessage.createdAt : null;

    const totalMessages = await Message.countDocuments({ chatId });

    const photosCount = await Message.countDocuments({
      chatId,
      media: { $ne: "" },
      mediaType: "image"
    });

    const latestPhotos = await Message.find({
      chatId,
      media: { $ne: "" },
      mediaType: "image"
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .select("media");

    const photoPreviews = latestPhotos.map(m => m.media);

    // Calculate late night messages (12 AM to 5 AM)
    const lateNightCount = await Message.countDocuments({
      chatId,
      $expr: {
        $and: [
          { $gte: [{ $hour: "$createdAt" }, 0] },
          { $lt: [{ $hour: "$createdAt" }, 5] }
        ]
      }
    });

    res.json({
      partner,
      stats: {
        friendsSince,
        firstMessageDate,
        totalMessages,
        photosCount,
        photoPreviews,
        lateNightCount,
        location: "India"
      }
    });
  } catch (error) {
    console.error("Get chat stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getChatStats;
