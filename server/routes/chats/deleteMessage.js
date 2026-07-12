import Message from "../../db/models/Messages.js";
import Chat from "../../db/models/Chat.js";

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        message.isDeleted = true;
        await message.save();

        // Update Chat's lastMessage if the deleted message was the last message
        const chat = await Chat.findById(message.chatId);
        if (chat && chat.lastMessage && chat.lastMessage.toString() === message._id.toString()) {
            const lastMsg = await Message.findOne({
                chatId: message.chatId,
                isDeleted: false,
                _id: { $ne: message._id }
            }).sort({ createdAt: -1 });

            if (lastMsg) {
                chat.lastMessage = lastMsg._id;
                chat.lastMessageAt = lastMsg.createdAt;
            } else {
                chat.lastMessage = null;
                chat.lastMessageAt = null;
            }
            await chat.save();
        }

        res.json({ message: "Message deleted successfully", messageId });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default deleteMessage;

