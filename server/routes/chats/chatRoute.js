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
const router=Router()

router.post("/",createChat)
// router.get("/",getChats)
router.get("/user",getChatsByUser)
router.get("/messages/:chatId",getMessages)
router.post("/sendMessage",sendMessage)
router.post("/replyMessage",replyMessage)
router.post("/clear", clearChat)
router.put("/mute", toggleMute)
router.put("/read-receipts", toggleReadReceipts)
router.put("/edit/:messageId", editMessage)
router.delete("/delete/:messageId", deleteMessage)
// router.get("/:id",getChat)

export default router
