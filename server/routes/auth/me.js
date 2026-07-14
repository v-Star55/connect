import User from "../../db/models/User.js";


const me = async (req, res) => {
  // req.user is populated by authMiddleware
  const user = await User.findById(req.user.id).select("name email username profilePicture blockedUsers");
  if(!user){
    res.status(400).json({message:"User not found"});
  }
  res.status(200).json({ user });
};

export default me;
