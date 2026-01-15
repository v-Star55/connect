import ChatMember from "../../db/models/ChatMember.js";

export default async function toggleReadReceipts(req, res) {
    try {
        const { chatId } = req.params;
        const { enabled } = req.body;
        const userId = req.user.id;

        const chatMember = await ChatMember.findOneAndUpdate(
            { chat: chatId, user: userId },
            { showReadReceipts: enabled },
            { new: true }
        );

        if (!chatMember) {
            return res.status(404).json({ message: "Chat connection not found" });
        }

        res.status(200).json({ 
            message: enabled ? "Read receipts enabled" : "Read receipts disabled", 
            showReadReceipts: chatMember.showReadReceipts 
        });
    } catch (error) {
        console.error("Toggle read receipts error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
