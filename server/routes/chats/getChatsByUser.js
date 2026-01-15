import ChatMember from "../../db/models/ChatMember.js";
import Message from "../../db/models/Messages.js";

export const getChatsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chatMembers = await ChatMember.find({
      user: userId,
      isDeleted: false,
    })
      .populate({
        path: "chat",
        populate: {
          path: "lastMessage",
          select: "content sender createdAt",
        },
      })
      .populate("lastReadMessage", "createdAt")
      .sort({ "chat.lastMessageAt": -1 })
      .skip(skip)
      .limit(limit);

    const totalChats = await ChatMember.countDocuments({
      user: userId,
      isDeleted: false,
    });

    const chats = await Promise.all(
      chatMembers.map(async (cm) => {
        const chat = cm.chat;

        let otherUser = null;

        if (chat.type === "private") {
          const members = await ChatMember.find({ chat: chat._id })
            .populate("user", "name username profilePicture");

          otherUser = members.find(
            (m) => m.user._id.toString() !== userId.toString()
          )?.user;
        }

        // ---- UNREAD COUNT LOGIC ----
        let unreadCount = 0;

        if (!cm.lastReadMessage) {
          // never read anything → count all messages not sent by me
          unreadCount = await Message.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
          });
        } else {
          unreadCount = await Message.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            createdAt: { $gt: cm.lastReadMessage.createdAt },
          });
        }
        // ----------------------------

        return {
          chatId: chat._id,
          type: chat.type,
          otherUserId: otherUser?._id,
          name: chat.type === "group" ? chat.name : otherUser?.name,
          profilePicture:
            chat.type === "group"
              ? chat.groupProfilePicture
              : otherUser?.profilePicture,
          lastMessage: chat.lastMessage,
          lastMessageAt: chat.lastMessageAt,
          unreadCount,
        };
      })
    );

    const hasMore = totalChats > skip + chats.length;
    const next = hasMore ? page + 1 : null;

    res.json({ chats, next });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default getChatsByUser;
