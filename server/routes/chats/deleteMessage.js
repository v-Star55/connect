import Message from "../../db/models/Messages.js";

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

        res.json({ message: "Message deleted successfully", messageId });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default deleteMessage;
