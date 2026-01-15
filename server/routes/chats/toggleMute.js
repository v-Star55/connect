import ChatMember from "../../db/models/ChatMember.js";

export default async function toggleMute(req, res) {
    try {
        const { chatId } = req.params;
        const { isMuted } = req.body;
        const userId = req.user.id;

        const chatMember = await ChatMember.findOneAndUpdate(
            { chat: chatId, user: userId },
            { isMuted },
            { new: true }
        );

        if (!chatMember) {
            return res.status(404).json({ message: "Chat connection not found" });
        }

        res.status(200).json({ message: isMuted ? "Chat muted" : "Chat unmuted", isMuted: chatMember.isMuted });
    } catch (error) {
        console.error("Toggle mute error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
