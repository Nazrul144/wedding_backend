const { create } = require("../Models/NotificationSchema");
const Schedule = require("../Models/ScheduleSchema");

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get schedules for a user
exports.getSchedulesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const schedules = await Schedule.find({
      $or: [{ fromUiserId: userId }, { officiantId: userId }],
    }).sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update schedule status
exports.updateScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleStatus, approvedStatus } = req.body;
    const schedule = await Schedule.findByIdAndUpdate(
        id,
        { scheduleStatus, approvedStatus },
        { new: true }
    );
    if(schedule)
        createNotification(schedule.fromUserId, "Schedule Update", `Your schedule for ${schedule.eventName} has been ${approvedStatus}.`);
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};