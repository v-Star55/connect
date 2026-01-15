import Message from "../../db/models/Messages.js";
import Chat from "../../db/models/Chat.js";

export const replyMessage = async (req, res) => {
  const { chatId, content, replyTo } = req.body;
  const userId = req.user.id;

  const msg = await Message.create({
    content,
    sender: userId,
    chatId,
    replyTo,
  });

  const populatedMsg = await Message.findById(msg._id).populate("sender", "name profilePicture");

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: msg._id,
    lastMessageAt: msg.createdAt,
  });

  res.status(201).json({ 
    message: {
      ...populatedMsg.toObject(),
      chatId: chatId 
    } 
  });
};

export default replyMessage;
