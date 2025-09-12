// Socket/socket.js
const { Server } = require("socket.io");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // change to frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Listen for messages
    socket.on("sendMessage", (data) => {
      console.log("📩 Message received:", data);

      // Broadcast to all connected clients
      io.emit("receiveMessage", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;
