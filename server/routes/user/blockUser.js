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
        }

        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        console.error("Block user error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
