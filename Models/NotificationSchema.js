const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // Modified to accept both String and ObjectId since the database shows strings
  userId: { 
    type: String, 
    required: true 
  },
  message: { type: String, required: true },
  type: {
    type: String,
    required: true,
  },

  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
