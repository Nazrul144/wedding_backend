const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  from_userName: { type: String, required: true },
  from_userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to_userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isRead: { type: Boolean, default: false },
  related_to:{type: mongoose.Schema.Types.ObjectId, ref: "Event", required: false},
  createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("notification", notificationSchema);
