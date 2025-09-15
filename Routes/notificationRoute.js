const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const { toggleReadStatus, getUserNotifications } = require("../Controllers/notificationController");

// ========= notification getting by user id=================
router.get("/my", auth, getUserNotifications);
// ========= toggle read status=================
router.patch("/toggle-read/:id", auth, toggleReadStatus);


module.exports = router;
