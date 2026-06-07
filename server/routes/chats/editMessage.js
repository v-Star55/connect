import Message from "../../db/models/Messages.js";

export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to edit this message" });
        }

        // Check if under 30 minutes
        const now = new Date();
        const createdDate = new Date(message.createdAt);
        const diffMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);

        if (diffMinutes > 30) {
            return res.status(403).json({ message: "Can't edit - 30 min time exceed" });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        const populatedMessage = await Message.findById(message._id).populate("sender", "name username profilePicture");

        res.json({ message: "Message edited successfully", updatedMessage: populatedMessage });
    } catch (error) {
        console.error("Edit message error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default editMessage;
