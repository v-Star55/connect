import mongoose from "mongoose";

const bucketListSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    timeframe: {
        type: String,
        enum: ["normal", "week", "month", "year", "custom"],
        default: "normal",
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

bucketListSchema.index({ chatId: 1 });

const BucketList = mongoose.model("BucketList", bucketListSchema);

export default BucketList;
