// Socket/socket.js
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs").promises;
const { ChatMessage, ChatRoom } = require("../Models/ChatSchema");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: true, // Allow all origins
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    allowEIO3: true, // Allow Engine.IO v3 clients
  });

  // Store active users and rooms
  const activeUsers = new Map();
  const roomUsers = new Map();
  const onlineUsers = new Map(); // Track online status by userId

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Handle user coming online
    socket.on("userOnline", ({ userId, userName }) => {
      onlineUsers.set(userId, {
        userName,
        socketId: socket.id,
        lastSeen: new Date(),
      });

      // Broadcast to all rooms this user is part of
      const userRooms = Array.from(roomUsers.keys()).filter((roomId) => {
        const roomUserList = roomUsers.get(roomId);
        return Array.from(roomUserList).some((u) => u.userId === userId);
      });

      userRooms.forEach((roomId) => {
        socket.to(roomId).emit("userStatusChanged", {
          userId,
          userName,
          isOnline: true,
          lastSeen: new Date(),
        });
      });
    });

    // Handle user going offline
    socket.on("userOffline", ({ userId, userName }) => {
      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);

        // Broadcast to all rooms this user is part of
        const userRooms = Array.from(roomUsers.keys()).filter((roomId) => {
          const roomUserList = roomUsers.get(roomId);
          return Array.from(roomUserList).some((u) => u.userId === userId);
        });

        userRooms.forEach((roomId) => {
          socket.to(roomId).emit("userStatusChanged", {
            userId,
            userName,
            isOnline: false,
            lastSeen: new Date(),
          });
        });
      }
    });

    // Handle joining a chat room
    socket.on("joinRoom", async ({ roomId, userId, userName }) => {
      socket.join(roomId);

      // Store user info
      activeUsers.set(socket.id, { userId, userName, roomId });

      // Add user to room
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add({ socketId: socket.id, userId, userName });

      console.log(`👤 User ${userName} (${userId}) joined room ${roomId}`);

      try {
        // Create or update room in database
        let room = await ChatRoom.findOne({ roomId });

        if (!room) {
          room = await ChatRoom.createRoom({
            roomId,
            type: "private",
            participants: [
              {
                userId,
                userName,
                role: "member",
                joinedAt: new Date(),
                isActive: true,
              },
            ],
          });
        } else {
          // Add participant if not already in room
          const existingParticipant = room.participants.find(
            (p) => p.userId === userId
          );
          if (!existingParticipant) {
            await ChatRoom.addParticipant(roomId, {
              userId,
              userName,
              role: "member",
              joinedAt: new Date(),
              isActive: true,
            });
          } else {
            // Update last seen
            await ChatRoom.findOneAndUpdate(
              { roomId, "participants.userId": userId },
              {
                $set: {
                  "participants.$.lastSeenAt": new Date(),
                  "participants.$.isActive": true,
                },
              }
            );
          }
        }

        // Send existing messages to the user who just joined
        const existingMessages = await ChatMessage.find({
          roomId,
          isDeleted: false,
        })
          .sort({ createdAt: 1 })
          .limit(50) // Load last 50 messages
          .exec();

        if (existingMessages.length > 0) {
          socket.emit("loadExistingMessages", {
            roomId,
            messages: existingMessages,
          });
        }
      } catch (error) {
        console.error("Error managing room in database:", error);
        socket.emit("joinError", {
          error: "Failed to join room",
          roomId,
        });
      }

      // Notify others in the room
      socket.to(roomId).emit("userJoined", {
        userId,
        userName,
        message: `${userName} joined the chat`,
      });

      // Send current online users in room
      const currentUsers = roomUsers.get(roomId);
      const userList = currentUsers
        ? Array.from(currentUsers).map((u) => ({
            userId: u.userId,
            userName: u.userName,
          }))
        : [];

      socket.emit("roomUsers", { roomId, users: userList });
    });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      console.log("📩 Message received:", data);

      const { roomId, sender, senderName, type, content, timestamp } = data;

      // Add server timestamp if not provided
      const messageData = {
        ...data,
        timestamp: timestamp || new Date().toISOString(),
        serverId: `msg_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      try {
        // Save message to database
        const chatMessage = new ChatMessage({
          messageId: messageData.serverId,
          roomId,
          sender,
          senderName,
          type: type || "text",
          content,
          fileData: data.fileData || null,
          replyTo: data.replyTo || null,
        });

        await chatMessage.save();

        // Broadcast to all clients in the room (including sender for confirmation)
        io.to(roomId).emit("receiveMessage", {
          ...messageData,
          _id: chatMessage._id,
          createdAt: chatMessage.createdAt,
        });

        // Log message for debugging
        console.log(
          `💬 Message in room ${roomId}: ${senderName} sent ${type}: ${content.substring(
            0,
            50
          )}...`
        );
      } catch (error) {
        console.error("Error saving message:", error);

        // Still broadcast even if database save fails
        io.to(roomId).emit("receiveMessage", messageData);

        // Send error to sender
        socket.emit("messageError", {
          error: "Failed to save message",
          originalMessage: messageData,
        });
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ roomId, userId, userName, isTyping }) => {
      socket.to(roomId).emit("userTyping", {
        userId,
        userName,
        isTyping,
      });
    });

    // Handle file sharing
    socket.on("shareFile", (fileData) => {
      const { roomId } = fileData;
      console.log("📎 File shared:", fileData.originalName);

      // Broadcast file to all users in room
      io.to(roomId).emit("receiveMessage", {
        ...fileData,
        timestamp: new Date().toISOString(),
        serverId: `file_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      });
    });

    // Handle leaving a room
    socket.on("leaveRoom", ({ roomId, userId, userName }) => {
      socket.leave(roomId);

      // Remove user from room
      if (roomUsers.has(roomId)) {
        const users = roomUsers.get(roomId);
        // Convert Set to Array to use find, then delete the found user
        const userArray = Array.from(users);
        const userToDelete = userArray.find((u) => u.socketId === socket.id);
        if (userToDelete) {
          users.delete(userToDelete);
        }

        if (users.size === 0) {
          roomUsers.delete(roomId);
        }
      }

      // Notify others in the room
      socket.to(roomId).emit("userLeft", {
        userId,
        userName,
        message: `${userName} left the chat`,
      });

      console.log(`👋 User ${userName} left room ${roomId}`);
    });

    // Handle getting room users
    socket.on("getRoomUsers", (roomId) => {
      const users = roomUsers.get(roomId);
      const userList = users
        ? Array.from(users).map((u) => ({
            userId: u.userId,
            userName: u.userName,
          }))
        : [];

      socket.emit("roomUsers", { roomId, users: userList });
    });

    // Handle message reactions
    socket.on(
      "addReaction",
      async ({ messageId, roomId, emoji, userId, userName }) => {
        try {
          // Save reaction to database
          await ChatMessage.findOneAndUpdate(
            { messageId },
            {
              $addToSet: {
                reactions: {
                  emoji,
                  userId,
                  userName,
                  reactedAt: new Date(),
                },
              },
            }
          );

          io.to(roomId).emit("messageReaction", {
            messageId,
            emoji,
            userId,
            userName,
            action: "add",
          });
        } catch (error) {
          console.error("Error adding reaction:", error);
          socket.emit("reactionError", {
            error: "Failed to add reaction",
            messageId,
          });
        }
      }
    );

    socket.on(
      "removeReaction",
      async ({ messageId, roomId, emoji, userId, userName }) => {
        try {
          // Remove reaction from database
          await ChatMessage.findOneAndUpdate(
            { messageId },
            {
              $pull: {
                reactions: {
                  emoji,
                  userId,
                },
              },
            }
          );

          io.to(roomId).emit("messageReaction", {
            messageId,
            emoji,
            userId,
            userName,
            action: "remove",
          });
        } catch (error) {
          console.error("Error removing reaction:", error);
          socket.emit("reactionError", {
            error: "Failed to remove reaction",
            messageId,
          });
        }
      }
    );

    // Handle message status updates (read receipts)
    socket.on(
      "markAsRead",
      async ({ roomId, messageIds, userId, userName }) => {
        try {
          // Update read status in database
          await ChatMessage.markAsRead(messageIds, userId, userName);

          socket.to(roomId).emit("messagesRead", {
            messageIds,
            userId,
            userName,
            readAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
          socket.emit("readError", {
            error: "Failed to mark messages as read",
            messageIds,
          });
        }
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);

      const user = activeUsers.get(socket.id);
      if (user) {
        const { roomId, userId, userName } = user;

        // Remove from room users
        if (roomUsers.has(roomId)) {
          const users = roomUsers.get(roomId);
          // Convert Set to Array to use find, then delete the found user
          const userArray = Array.from(users);
          const userToDelete = userArray.find((u) => u.socketId === socket.id);
          if (userToDelete) {
            users.delete(userToDelete);
          }

          if (users.size === 0) {
            roomUsers.delete(roomId);
          }
        }

        // Notify room about user leaving
        socket.to(roomId).emit("userLeft", {
          userId,
          userName,
          message: `${userName} disconnected`,
        });

        activeUsers.delete(socket.id);
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("❗ Socket error:", error);
    });
  });

  return io;
}

module.exports = setupSocket;
