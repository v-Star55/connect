import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,   // hello 
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // vaibhav
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",   // chatId 1124
        required: true,
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    media: {
        type: String,
        default: "",
    },  
    mediaType: {
        type: String,
        enum: ["image", "video", "audio", "document"],
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
