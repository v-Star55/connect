import ChatMember from "../../db/models/ChatMember.js";

export default async function clearChat(req, res) {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const chatMember = await ChatMember.findOneAndUpdate(
            { chat: chatId, user: userId },
            { messagesClearedAt: new Date() },
            { new: true }
        );

        if (!chatMember) {
            return res.status(404).json({ message: "Chat connection not found" });
        }

        res.status(200).json({ message: "Chat cleared successfully" });
    } catch (error) {
        console.error("Clear chat error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
