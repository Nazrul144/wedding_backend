const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  from_userName: { type: String, required: true },
  from_userId: { type: String, required: true },
  to_userId: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  related_to:{type: String, required: false},
  createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("note", noteSchema)