const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  partner_1: {
    type: String,
    required: true,
  },
  partner_2: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "officiant"],
    default: "user",
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  weddingDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }

});


const User = mongoose.model("UserCredit", userSchema, "User");
