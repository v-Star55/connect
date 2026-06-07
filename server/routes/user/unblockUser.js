import User from "../../db/models/User.js";

export default async function unblockUser(req, res) {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const user = await User.findById(currentUserId);
        
        user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId.toString());
        await user.save();

        // Notify via socket
        const io = req.app.get("io");
        if (io) {
            const ChatMember = (await import("../../db/models/ChatMember.js")).default;
            const myChats = await ChatMember.find({ user: currentUserId }).populate('chat');
            const privateChats = myChats.filter(cm => cm.chat.type === 'private');
            
            for (const cm of privateChats) {
                const otherMember = await ChatMember.findOne({ 
                    chat: cm.chat._id, 
                    user: userId 
                });
                
                if (otherMember) {
                    io.to(String(cm.chat._id)).emit("userUnblocked", {
                        unblockedBy: currentUserId,
                        unblockedUser: userId,
                        chatId: cm.chat._id
                    });
                }
            }
        }

        res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        console.error("Unblock user error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
