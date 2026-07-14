import { Router } from "express";
import getChatsByUser from "./getChatsByUser.js";
import getMessages from "./getMessages.js";
import clearChat from "./clearChat.js";
import toggleMute from "./toggleMute.js";
import toggleReadReceipts from "./toggleReadReceipts.js";
import createChat from "./createChat.js";
import sendMessage from "./sendMessage.js";
import replyMessage from "./replyMessage.js";
import editMessage from "./editMessage.js";
import deleteMessage from "./deleteMessage.js";
import uploadFile from "./uploadFile.js";
import markChatAsRead from "./markChatAsRead.js";
import getChatStats from "./getChatStats.js";
import getBucketList from "./getBucketList.js";
import createBucketListItem from "./createBucketListItem.js";
import toggleBucketListItem from "./toggleBucketListItem.js";
import deleteBucketListItem from "./deleteBucketListItem.js";

const router=Router()

router.post("/",createChat)
// router.get("/",getChats)
router.get("/user",getChatsByUser)
router.get("/messages/:chatId",getMessages)
router.get("/stats/:chatId", getChatStats)
router.post("/sendMessage",sendMessage)
router.post("/upload", uploadFile)
router.post("/replyMessage",replyMessage)
router.post("/clear", clearChat)
router.put("/mute", toggleMute)
router.put("/read-receipts", toggleReadReceipts)
router.put("/read/:chatId", markChatAsRead)
router.put("/edit/:messageId", editMessage)
router.delete("/delete/:messageId", deleteMessage)

// Shared Bucket List routes
router.get("/bucketlist/:chatId", getBucketList)
router.post("/bucketlist", createBucketListItem)
router.put("/bucketlist/:itemId/toggle", toggleBucketListItem)
router.delete("/bucketlist/:itemId", deleteBucketListItem)

export default router


