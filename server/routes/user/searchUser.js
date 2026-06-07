import User from "../../db/models/User.js";
import UserConnection from "../../db/models/UserConnections.js";

export const searchUser = async (req, res) => {
  try {
    const q = req.query.q;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === "") {
      return res.json({ users: [], next: null });
    }

    const regex = new RegExp(q, "i");

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { username: regex },
        { name: regex }
      ]
    })
      .select("name username profilePicture")
      .skip(skip)
      .limit(limit)
      .lean();

    // Get connection statuses for the found users
    const userIds = users.map(user => user._id);
    const connections = await UserConnection.find({
      $or: [
        { requester: req.user.id, receiver: { $in: userIds } },
        { receiver: req.user.id, requester: { $in: userIds } }
      ]
    });

    const usersWithStatus = users.map(user => {
      const connection = connections.find(c => 
        c.requester.toString() === user._id.toString() || 
        c.receiver.toString() === user._id.toString()
      );
      return {
        ...user,
        connectionStatus: connection ? connection.status : null
      };
    });

    const totalUsers = await User.countDocuments({
      _id: { $ne: req.user.id },
      $or: [
        { username: regex },
        { name: regex }
      ]
    });

    const hasMore = totalUsers > skip + users.length;
    const next = hasMore ? page + 1 : null;

    res.json({ users: usersWithStatus, next });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default searchUser;
