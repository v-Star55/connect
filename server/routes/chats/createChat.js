import ChatMember from "../../db/models/ChatMember.js";
import Chat from "../../db/models/Chat.js";
import User from "../../db/models/User.js";
import mongoose from "mongoose";

export default async (req, res) => {
  try {
    const { name, type, otherUserId } = req.body;
    const userId = req.user.id;

    // Validate current user
    const me = await User.findById(userId);
    if (!me) return res.status(404).json({ message: "User not found" });

    // ---------- PRIVATE CHAT LOGIC ----------
    if (type === "private") {
      if (!otherUserId) {
        return res.status(400).json({ message: "otherUserId required" });
      }

      // Check if private chat already exists
      const existing = await ChatMember.aggregate([
        {
          $match: {
            user: {
              $in: [
                new mongoose.Types.ObjectId(userId),
                new mongoose.Types.ObjectId(otherUserId),
              ],
            },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$chat",
            users: { $addToSet: "$user" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: 2 } },
        {
          $lookup: {
            from: "chats",
            localField: "_id",
            foreignField: "_id",
            as: "chat",
          },
        },
        { $unwind: "$chat" },
        { $match: { "chat.type": "private" } },
      ]);

      if (existing.length > 0) {
        return res.status(200).json({
          chat: existing[0].chat,
          message: "Private chat already exists",
        });
      }

      // Create new private chat
      const chat = await Chat.create({
        type: "private",
        lastMessageAt: new Date(),
      });

      await ChatMember.insertMany([
        { user: userId, chat: chat._id, role: "member" },
        { user: otherUserId, chat: chat._id, role: "member" },
      ]);

      return res.status(201).json({ chat });
    }

    return res.status(400).json({ message: "Invalid chat type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
