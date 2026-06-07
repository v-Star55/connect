import UserStats from "../../db/models/userStatsSchema.js";

export const updateVibe = async (req, res) => {
  try {
    const { vibes } = req.body; // Array of strings
    const userId = req.user.id;

    if (!Array.isArray(vibes) || vibes.length > 3) {
      return res.status(400).json({ message: "You can select up to 3 vibes." });
    }

    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    stats.vibe = vibes;
    await stats.save();

    res.json(stats);
  } catch (error) {
    console.error("Update vibe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
