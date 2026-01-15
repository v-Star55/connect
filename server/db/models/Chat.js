import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    groupProfilePicture: {
        type: String,
        default: "",
    },
    groupBio: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        enum: ["group", "private"],  // private
        default: "private",
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",   // messageId 1124
        default: null,
    },
    lastMessageAt: {
        type: Date,  // date
        default: null,
    }, 
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;

