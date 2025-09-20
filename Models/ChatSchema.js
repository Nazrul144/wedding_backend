const mongoose = require("mongoose");

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    roomId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
      ref: "User", // Assuming you have a User model
    },
    senderName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "image",
        "file",
        "document",
        "system",
        "link",
        "booking_proposal",
      ],
      default: "text",
    },
    content: {
      type: String,
      required: true,
    },
    // For file messages
    fileData: {
      originalName: String,
      filename: String,
      fileUrl: String,
      fileSize: Number,
      mimeType: String,
    },
    // Message status
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    // Reactions
    reactions: [
      {
        emoji: String,
        userId: String,
        userName: String,
        reactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Read receipts
    readBy: [
      {
        userId: String,
        userName: String,
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Editing history
    editHistory: [
      {
        previousContent: String,
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    // Reply to another message
    replyTo: {
      messageId: String,
      content: String,
      senderName: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Chat Room Schema
const chatRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["private", "group", "public"],
      default: "private",
    },
    participants: [
      {
        userId: {
          type: String,
          required: true,
          ref: "User",
        },
        userName: String,
        role: {
          type: String,
          enum: ["admin", "moderator", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastSeenAt: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    settings: {
      allowFileUpload: {
        type: Boolean,
        default: true,
      },
      maxFileSize: {
        type: Number,
        default: 50 * 1024 * 1024, // 50MB
      },
      allowedFileTypes: [String],
      isPublic: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      totalMessages: {
        type: Number,
        default: 0,
      },
      lastMessage: {
        content: String,
        senderName: String,
        timestamp: Date,
      },
      createdBy: {
        userId: String,
        userName: String,
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
// messageId index is automatically created due to unique: true
chatMessageSchema.index({ "readBy.userId": 1 });

// roomId index is automatically created due to unique: true
chatRoomSchema.index({ "participants.userId": 1 });
chatRoomSchema.index({ type: 1 });

// Virtual for getting unread message count
chatMessageSchema.virtual("isUnread").get(function () {
  return this.readBy.length === 0;
});

// Virtual for getting active participants count
chatRoomSchema.virtual("activeParticipantsCount").get(function () {
  return this.participants.filter((p) => p.isActive).length;
});

// Middleware to update room metadata when a message is created
chatMessageSchema.post("save", async function (doc) {
  try {
    await mongoose.model("ChatRoom").findOneAndUpdate(
      { roomId: doc.roomId },
      {
        $inc: { "metadata.totalMessages": 1 },
        $set: {
          "metadata.lastMessage": {
            content: doc.content,
            senderName: doc.senderName,
            timestamp: doc.createdAt,
          },
        },
      }
    );
  } catch (error) {
    console.error("Error updating room metadata:", error);
  }
});

// Static methods for ChatMessage
chatMessageSchema.statics.getMessagesByRoom = function (
  roomId,
  page = 1,
  limit = 50
) {
  return this.find({ roomId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
};

chatMessageSchema.statics.markAsRead = function (messageIds, userId, userName) {
  return this.updateMany(
    {
      messageId: { $in: messageIds },
      "readBy.userId": { $ne: userId },
    },
    {
      $addToSet: {
        readBy: {
          userId,
          userName,
          readAt: new Date(),
        },
      },
    }
  );
};

// Static methods for ChatRoom
chatRoomSchema.statics.createRoom = function (roomData) {
  return this.create({
    roomId:
      roomData.roomId ||
      `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...roomData,
  });
};

chatRoomSchema.statics.addParticipant = function (roomId, participant) {
  return this.findOneAndUpdate(
    { roomId },
    { $addToSet: { participants: participant } },
    { new: true }
  );
};

chatRoomSchema.statics.removeParticipant = function (roomId, userId) {
  return this.findOneAndUpdate(
    { roomId },
    { $pull: { participants: { userId } } },
    { new: true }
  );
};

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

module.exports = {
  ChatMessage,
  ChatRoom,
};
