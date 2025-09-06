const Notification = require("../Models/NotificationSchema");

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId 
        console.log("Fetching notifications for user:", userId);
        const notifications = await Notification.find({ userId }).sort({
            createdAt: -1,
        });
        res.status(200).json({ notifications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//update for Toggle read status
exports.toggleReadStatus = async (req, res) => {
  try {
    const { id } = req.para                                                                                                                                                                                                                                                                                                                                                                                                                                     ms;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.isRead = !notification.isRead;
    await notification.save();

    res.status(200).json({
      msg: `Notification marked as ${notification.isRead ? "read" : "unread"}`,
      notification,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manual notification creation
exports.createNotificationManual = async (req, res) => {
  try {
    const { userId, type, customMessage } = req.body;
    const notification = await createNotification(userId, type, customMessage);

    res.status(201).json({ msg: "Notification created", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Exported function to create notifications
exports.createNotification = async (userId, type, customMessage = null) => {
  try {
    const message = customMessage;
    const notification = new Notification({
      userId,
      message,
      type,
    });
    await notification.save();
    console.log(`Notification sent to user ${userId}: ${message}`);
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};


