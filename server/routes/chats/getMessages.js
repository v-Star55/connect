import Message from "../../db/models/Messages.js"

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      chatId,
      isDeleted: false,
    })
      .populate("sender", "name username profilePicture")
      .sort({ createdAt: -1 }) // Get latest messages first
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({
      chatId,
      isDeleted: false,
    });

    const hasMore = totalMessages > skip + messages.length;
    const next = hasMore ? page + 1 : null;

    res.json({
      messages, 
      next,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default getMessages;
