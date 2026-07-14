import BucketList from "../../db/models/BucketList.js";

export const createBucketListItem = async (req, res) => {
  const { chatId, title, timeframe, customEndDate } = req.body;
  const userId = req.user.id;

  try {
    let startDate = new Date();
    let endDate = null;

    if (timeframe === "week") {
      endDate = new Date();
      endDate.setDate(startDate.getDate() + 7);
    } else if (timeframe === "month") {
      endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);
    } else if (timeframe === "year") {
      endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 1);
    } else if (timeframe === "custom" && customEndDate) {
      endDate = new Date(customEndDate);
    }

    const item = await BucketList.create({
      chatId,
      title,
      timeframe,
      createdBy: userId,
      startDate,
      endDate,
    });

    const populatedItem = await BucketList.findById(item._id)
      .populate("createdBy", "name profilePicture")
      .populate("completedBy", "name profilePicture");

    res.status(201).json({ item: populatedItem });
  } catch (error) {
    console.error("Create bucket list item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default createBucketListItem;
