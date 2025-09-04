const notification= require("../Models/NoteSchema");


exports.createNotification = async (req, res) => {
  const { title, message, from_userName, from_userId, to_userId , related_to} = req.body;

  try {
    const newNotification = new notification({
      title,
      message,
      from_userName,
      from_userId,
      to_userId,
      related_to
    });

    await newNotification.save();
    res.status(201).json({ msg: "Notification created successfully", newNotification });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: err.message });
  }
}