import Message from "../../db/models/Messages.js";
import Chat from "../../db/models/Chat.js";
import ChatMember from "../../db/models/ChatMember.js";
import User from "../../db/models/User.js";
import UserConnection from "../../db/models/UserConnections.js";
import { updateChatStreak } from "../../utils/streakHelper.js";

export const sendMessage = async (req, res) => {
  const { chatId, content, media, mediaType } = req.body;
  const userId = req.user.id;

  try {
    // Check if blocked
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (chat.type === "private") {
      // Find the other user
      const members = await ChatMember.find({ chat: chatId });
      const otherMember = members.find(m => m.user.toString() !== userId.toString());
      
      if (otherMember) {
        const otherUserId = otherMember.user;
        
        const [currentUser, targetUser] = await Promise.all([
          User.findById(userId).select("blockedUsers"),
          User.findById(otherUserId).select("blockedUsers")
        ]);
 
        const isBlockedByMe = currentUser.blockedUsers.some(id => id.toString() === otherUserId.toString());
        if (isBlockedByMe) {
          return res.status(403).json({ message: "You have blocked this user" });
        }
 
        const isBlockedByOther = targetUser.blockedUsers.some(id => id.toString() === userId.toString());
        if (isBlockedByOther) {
          return res.status(403).json({ message: "This user has blocked you" });
        }

        // Check that an accepted connection still exists
        const connection = await UserConnection.findOne({
          status: "accepted",
          $or: [
            { requester: userId, receiver: otherUserId },
            { requester: otherUserId, receiver: userId },
          ],
        });
        if (!connection) {
          return res.status(403).json({ message: "You are no longer connected with this user" });
        }

        // Update chat streak
        await updateChatStreak(userId, otherUserId);
      }
    }

    const msg = await Message.create({
      content,
      sender: userId,
      chatId,
      media: media || "",
      mediaType: mediaType || null,
    });

    const populatedMsg = await Message.findById(msg._id).populate("sender", "name profilePicture");

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: msg._id,
      lastMessageAt: msg.createdAt,
    });

    res.status(201).json({ 
      message: {
        ...populatedMsg.toObject(),
        chatId: chatId 
      } 
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default sendMessage;