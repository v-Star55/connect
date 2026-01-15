import UserConnection from "../../db/models/UserConnections.js";

export default async function getConnectionRequest(req,res){
    try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const connectionRequests = await UserConnection.find({ 
        receiver: req.user.id, 
        status: "pending" 
    })
        .populate("requester", "name username profilePicture")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalRequests = await UserConnection.countDocuments({ 
        receiver: req.user.id, 
        status: "pending" 
    });

    const hasMore = totalRequests > skip + connectionRequests.length;
    const next = hasMore ? page + 1 : null;

    res.status(200).json({ requests: connectionRequests, next });
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
}
