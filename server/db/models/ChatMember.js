import mongoose from "mongoose";

const chatMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // vaibhav
        required: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",  // chatId 1124
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "member"], //admin
        default: "member",
    },
    isMuted: {
        type: Boolean,   
        default: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    lastReadMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    showReadReceipts: {
        type: Boolean,
        default: true,
    },
    messagesClearedAt: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

chatMemberSchema.index({ chat: 1, user: 1 }, { unique: true });
chatMemberSchema.index({ user: 1, isDeleted: 1 });

const ChatMember = mongoose.model("ChatMember", chatMemberSchema);
export default ChatMember;