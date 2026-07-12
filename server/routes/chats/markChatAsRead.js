import Message from "../../db/models/Messages.js";
import ChatMember from "../../db/models/ChatMember.js";

export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    console.log(`[Backend markChatAsRead] Received request for chatId: ${chatId}, userId: ${userId}`);

    // Find the latest message in this chat (that is not deleted)
    const latestMessage = await Message.findOne({ 
      chatId, 
      isDeleted: false 
    }).sort({ createdAt: -1 });

    console.log(`[Backend markChatAsRead] Latest message found: ${latestMessage?._id}, content: "${latestMessage?.content}"`);

    if (latestMessage) {
      const updatedMember = await ChatMember.findOneAndUpdate(
        { chat: chatId, user: userId },
        { lastReadMessage: latestMessage._id },
        { new: true }
      );
      console.log(`[Backend markChatAsRead] Updated ChatMember ${updatedMember?._id} with lastReadMessage: ${latestMessage._id}`);

      // Broadcast socket event to the chat room
      const io = req.app.get("io");
      if (io) {
        console.log(`[Backend markChatAsRead] Emitting socket event chatRead to room ${chatId} for user ${userId}`);
        io.to(String(chatId)).emit("chatRead", {
          chatId,
          userId,
          lastReadMessageId: latestMessage._id,
          lastReadMessageTime: latestMessage.createdAt
        });
      } else {
        console.warn(`[Backend markChatAsRead] io instance was not found on app`);
      }
    }

    res.status(200).json({ message: "Chat marked as read" });
  } catch (error) {
    console.error("Mark chat as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default markChatAsRead;
