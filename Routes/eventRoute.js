const express = require("express");

const auth = require("../Middleware/authMiddleware");
const { createEvent, updateEvent, deleteEvent, getEventsByRole, getAllEvents } = require("../Controllers/eventController");
const { deleteUser } = require("../Controllers/UserController");

const router = express.Router();

// create event
router.post("/create",auth, createEvent)

// Update event
router.patch("/update/:id", auth, updateEvent);

// delete event
router.delete("/delete/:id", auth, deleteEvent);

// get event by user or officiant id
router.get("/by-role/:id/:role", auth, getEventsByRole);

// get all events
router.get("/all",auth,deleteUser)
 

module.exports = router;
