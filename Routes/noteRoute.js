const express = require("express");
const {
  createNote,
  getNotesByUserId,
  deleteNote
} = require("../Controllers/noteController");
const auth = require("../Middleware/authMiddleware");

const router = express.Router(); 

// create note
router.post("/create", auth, createNote);

// delete note
router.delete("/delete/:id", auth, deleteNote);

// get notes by user ID 
router.get("/forUser/:userId", auth, getNotesByUserId);

// delete note from user side can be implemented by updating the from and the to user IDs to null or a specific value 

// permanent delete note
router.delete("/delete/:id", auth, deleteNote);

module.exports = router;  