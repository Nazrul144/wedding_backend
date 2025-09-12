const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// DB Connection
require("./DB/Connection");

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const userRoutes = require("./Routes/userRoute");
const noteRoutes = require("./Routes/noteRoute");
const eventRoutes = require("./Routes/eventRoute");
const reviewRoute = require("./Routes/reviewRoute");
const notificationRoute = require("./Routes/notificationRoute");
const scheduleRoute = require("./Routes/scheduleRoute");

app.use("/api/users", userRoutes);

app.use("/api/notes", noteRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reviews", reviewRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/schedule", scheduleRoute);

// Serve frontend/public folder
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create HTTP server
const server = http.createServer(app);

// Import and setup Socket.IO
const setupSocket = require("./Socket/socket");
setupSocket(server);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
