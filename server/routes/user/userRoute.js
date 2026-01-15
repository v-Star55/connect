import { Router } from "express";
import searchUser from "./searchUser.js";
import addFriend from "./addFriend.js";
import getConnectionRequest from "./getConnectionRequest.js";
import getUserConnection from "./getUserConnection.js";
import acceptConnectionRequest from "./acceptConnectionRequest.js";
import rejectConnectionRequest from "./rejectConnectionRequest.js";
import blockUser from "./blockUser.js";

const router=Router();


router.get('/search',searchUser)
router.post('/add-friend/:userId',addFriend)
router.get('/connections',getUserConnection)
router.get('/connections/request',getConnectionRequest)
router.put('/connections/accept/:requestId',acceptConnectionRequest)
router.put('/connections/reject/:requestId',rejectConnectionRequest)
router.post('/block/:userId', blockUser)


export default router;