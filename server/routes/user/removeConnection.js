import UserConnection from "../../db/models/UserConnections.js";
import ChatMember from "../../db/models/ChatMember.js";

export default async function removeConnection(req, res) {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (userId === currentUserId) {
            return res.status(400).json({ message: "You cannot remove yourself" });
        }

        // Delete the accepted connection document (either direction)
        const result = await UserConnection.deleteOne({
            status: "accepted",
            $or: [
                { requester: currentUserId, receiver: userId },
                { requester: userId, receiver: currentUserId },
            ],
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No active connection found" });
        }

        // Find the shared private chat(s) between both users
        const myMemberships = await ChatMember.find({ user: currentUserId }).populate("chat");
        const privateChats = myMemberships.filter(cm => cm.chat?.type === "private");

        const io = req.app.get("io");
        const affectedChatIds = [];

        for (const cm of privateChats) {
            const otherMember = await ChatMember.findOne({
                chat: cm.chat._id,
                user: userId,
            });

            if (otherMember) {
                affectedChatIds.push(String(cm.chat._id));

                // Soft-delete the chat from both users' lists
                await ChatMember.updateMany(
                    { chat: cm.chat._id },
                    { $set: { isDeleted: true } }
                );

                // Notify both users via socket
                if (io) {
                    io.to(String(cm.chat._id)).emit("connectionRemoved", {
                        removedBy: currentUserId,
                        removedUser: userId,
                        chatId: cm.chat._id,
                    });
                }
            }
        }

        res.status(200).json({ message: "Connection removed successfully", affectedChatIds });
    } catch (error) {
        console.error("Remove connection error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
