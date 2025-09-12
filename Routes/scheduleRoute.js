const express = require("express");
const auth = require("../Middleware/authMiddleware");
const router = express.Router();

const {
  createSchedule,
  getSchedulesByUser,
  updateScheduleStatus,
  deleteSchedule
} = require("../Controllers/schedulerController");


// Create a new schedule
router.post("/create", auth, createSchedule);

// Get schedules for a user
router.get("/get/:userId", auth, getSchedulesByUser);

// Update schedule status
router.put("/update/:id", auth, updateScheduleStatus);

// Delete a schedule
router.delete("/delete/:id", auth, deleteSchedule);

module.exports = router;