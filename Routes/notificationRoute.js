const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const { toggleReadStatus, getUserNotifications } = require("../Controllers/notificationController");

router.get("/my", auth, getUserNotifications);
router.patch("/toggle-read/:id", auth, toggleReadStatus);


module.exports = router;
