import UserConnection from "../../db/models/UserConnections.js";


export default async function addFriend(req, res) {
    const targetUserId = req.params.userId;   //  from URL
    const myUserId = req.user.id;    // from middleware

    const connection = new UserConnection({
        requester: myUserId,
        receiver: targetUserId,
        status: "pending",
    })

    await connection.save()
    res.status(200).json({ message: "connection request sent successfully" })
}