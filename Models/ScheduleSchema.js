const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromUserName: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId,required: true },
    eventName: { type: String, required: true },
    scheduleDate: { type: Date, required: false },
    scheduleDateTime: { type: String, required: false },
    scheduleStatus : { type: Boolean, required: true },
    officiantName: { type: String, required: true },
    officiantImage: { type: String, required: false },
    officiantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    officiantWorkStatus: { type: String, required: true },
    message: { type: String, required: false },
    packageName: { type: String, required: true },
    approvedStatus: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Schedule", ScheduleSchema);
