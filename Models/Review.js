const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userImageUrl: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      
      required: true,
    },
    ratingDescription: {
      type: String,
      required: false,
    },
    officiantId: {
      type: mongoose.Schema.Types.ObjectId,
      
      required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isVisible:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
