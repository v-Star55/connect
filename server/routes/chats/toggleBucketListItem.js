import BucketList from "../../db/models/BucketList.js";

export const toggleBucketListItem = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const item = await BucketList.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const newCompleted = !item.completed;
    item.completed = newCompleted;
    item.completedBy = newCompleted ? userId : null;
    await item.save();

    const populatedItem = await BucketList.findById(item._id)
      .populate("createdBy", "name profilePicture")
      .populate("completedBy", "name profilePicture");

    res.status(200).json({ item: populatedItem });
  } catch (error) {
    console.error("Toggle bucket list item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default toggleBucketListItem;
