import BucketList from "../../db/models/BucketList.js";

export const deleteBucketListItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await BucketList.findByIdAndDelete(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete bucket list item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default deleteBucketListItem;
