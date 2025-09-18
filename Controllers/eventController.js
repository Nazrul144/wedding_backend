const event = require("../Models/EventSchema");

// create event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, ceremonyType, userId } = req.body;
    if (!title || !description || !ceremonyType || !userId) {
      return res.status(400).json({
        error:
          "Missing required fields: title, description, ceremonyType, and userId are required",
      });
    }
    const newEvent = new event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json({
      msg: "Event created successfully",
      event: savedEvent,
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const updates = req.body;
  try {
    const updatedEvent = await event.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ msg: "Event updated successfully", updatedEvent });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: err.message });
  } 
};

// delete event
exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  try {
    const deletedEvent = await event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ msg: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await event.find();
    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get events by role and id
exports.getEventsByRole = async (req, res) => {
  const { id, role } = req.params;
  try {
    let query = {};
    if (role === "officiant") {
      query.officiantId = id;
    } else {
      query.userId = id;
    }
    const events = await event.find(query);
    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching events by role:", err);
    res.status(500).json({ error: err.message });
  }
};
