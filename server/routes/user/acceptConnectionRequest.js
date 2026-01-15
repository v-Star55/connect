import UserConnection from "../../db/models/UserConnections.js";

export default async function acceptConnectionRequest(req, res) {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        // Find the connection request
        const connection = await UserConnection.findOne({
            _id: requestId,
            receiver: userId,
            status: "pending"
        });

        if (!connection) {
            return res.status(404).json({ error: "Connection request not found" });
        }

        // Update status to accepted
        connection.status = "accepted";
        await connection.save();

        res.status(200).json({ 
            message: "Connection request accepted", 
            connection 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}
