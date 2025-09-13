const express= require("express");
const auth = require("../Middleware/authMiddleware");
const router = express.Router();
const {addSubscriber, getAllSubscribers}= require("./../Controllers/Marketing_othersController");

// Add a new subscriber from home page
router.post("/subscribe", addSubscriber);

// get all user list for officiants
router.get("/subscribers", auth, getAllSubscribers);


module.exports = router;
