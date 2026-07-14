import BucketList from "../../db/models/BucketList.js";

export const getBucketList = async (req, res) => {
  const { chatId } = req.params;

  try {
    const items = await BucketList.find({ chatId })
      .populate("completedBy", "name profilePicture")
      .populate("createdBy", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({ items });
  } catch (error) {
    console.error("Get bucket list error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getBucketList;
