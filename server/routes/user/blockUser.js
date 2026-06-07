import User from "../../db/models/User.js";

export default async function blockUser(req, res) {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (userId === currentUserId) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const user = await User.findById(currentUserId);
        if (!user.blockedUsers.includes(userId)) {
            user.blockedUsers.push(userId);
            await user.save();

            // Notify via socket if they have a private chat
            const io = req.app.get("io");
            if (io) {
                const ChatMember = (await import("../../db/models/ChatMember.js")).default;
                
                // Find private chat between these two
                const myChats = await ChatMember.find({ user: currentUserId }).populate('chat');
                const privateChats = myChats.filter(cm => cm.chat.type === 'private');
                
                for (const cm of privateChats) {
                    const otherMember = await ChatMember.findOne({ 
                        chat: cm.chat._id, 
                        user: userId 
                    });
                    
                    if (otherMember) {
                        io.to(String(cm.chat._id)).emit("userBlocked", {
                            blockedBy: currentUserId,
                            blockedUser: userId,
                            chatId: cm.chat._id
                        });
                    }
                }
            }
        }

        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        console.error("Block user error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
