import User from "../../db/models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture, aboutMe } = req.body;
    const userId = req.user.id;

    if (bio && bio.length > 50) {
      return res.status(400).json({ message: "Bio must be 50 characters or less." });
    }

    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio; 
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    if (aboutMe !== undefined) updates.aboutMe = aboutMe;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password -__v");

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
