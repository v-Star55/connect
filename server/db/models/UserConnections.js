import mongoose from "mongoose";


const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "blocked"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

connectionSchema.index({ requester: 1, receiver: 1, status: 1 });
connectionSchema.index({ receiver: 1, requester: 1, status: 1 });

const UserConnection=mongoose.model("UserConnection",connectionSchema)

export default UserConnection
