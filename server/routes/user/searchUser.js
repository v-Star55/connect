import mongoose from "mongoose";
import User from "../../db/models/User.js";
import UserStats from "../../db/models/userStatsSchema.js";
import UserConnection from "../../db/models/UserConnections.js";

export const searchUser = async (req, res) => {
  try {
    const q = req.query.q;
    const vibe = req.query.vibe;
    const sortBy = req.query.sortBy;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;



    const regex = q && q.trim() !== "" ? new RegExp(q.trim(), "i") : null;

    const basePipeline = [];

    // 1. Initial Match (excluding current user, and filtering by search query if present)
    const matchCriteria = {
      _id: { $ne: new mongoose.Types.ObjectId(req.user.id) }
    };
    if (regex) {
      matchCriteria.$or = [
        { username: regex },
        { name: regex }
      ];
    }
    basePipeline.push({ $match: matchCriteria });

    // 2. Lookup userstats
    basePipeline.push(
      {
        $lookup: {
          from: "userstats",
          localField: "_id",
          foreignField: "userId",
          as: "stats"
        }
      },
      {
        $unwind: {
          path: "$stats",
          preserveNullAndEmptyArrays: true
        }
      }
    );

    // 3. Vibe Filter
    if (vibe && vibe !== "All") {
      basePipeline.push({
        $match: {
          "stats.vibe": vibe
        }
      });
    }

    // Count total matches
    const countResult = await User.aggregate([
      ...basePipeline,
      { $count: "total" }
    ]);
    const totalUsers = countResult[0]?.total || 0;

    // Fetch users with sorting and pagination
    const queryPipeline = [...basePipeline];

    if (sortBy === "recentlyActive") {
      queryPipeline.push({
        $sort: { isOnline: -1, lastActive: -1 }
      });
    } else if (sortBy === "newest") {
      queryPipeline.push({
        $sort: { createdAt: -1 }
      });
    } else {
      // Default: Suggested (vibe match overlap, then online, then lastActive)
      const loggedInUserStats = await UserStats.findOne({ userId: req.user.id });
      const loggedInUserVibes = loggedInUserStats?.vibe || [];
      queryPipeline.push({
        $addFields: {
          vibeOverlapCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$stats.vibe", []] },
                loggedInUserVibes
              ]
            }
          }
        }
      });
      queryPipeline.push({
        $sort: { vibeOverlapCount: -1, isOnline: -1, lastActive: -1 }
      });
    }

    queryPipeline.push(
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          username: 1,
          profilePicture: 1,
          isOnline: 1,
          lastActive: 1,
          createdAt: 1,
          "stats.vibe": 1
        }
      }
    );

    const users = await User.aggregate(queryPipeline);

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

    const hasMore = totalUsers > skip + users.length;
    const next = hasMore ? page + 1 : null;

    res.json({ users: usersWithStatus, next });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default searchUser;
