import UserConnection from "../../db/models/UserConnections.js";

export default async function getUserConnection(req,res){
    try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const connections = await UserConnection.find({
        status: "accepted",
        $or: [
            { receiver: req.user.id },
            { requester: req.user.id }
        ]
    }).populate("receiver requester", "name username profilePicture isOnline lastActive")
      .skip(skip)
      .limit(limit);

    const totalConnections = await UserConnection.countDocuments({
        status: "accepted",
        $or: [
            { receiver: req.user.id },
            { requester: req.user.id }
        ]
    });

    const hasMore = totalConnections > skip + connections.length;
    const next = hasMore ? page + 1 : null;

    res.status(200).json({ connections, next });
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
}