const express = require("express");
const auth = require("../Middleware/authMiddleware");
const { createReview, getReviewsForOfficiant, updateReviewVisibility } = require("../Controllers/ReviewController");
const router = express.Router();

// Creating a review
router.post("/create", auth, createReview);

// Get reviews for officiants
router.get("/officiant/:officiantId", auth, getReviewsForOfficiant);

// Update review visibility
router.patch("/visibility/:reviewId", auth, updateReviewVisibility);

module.exports = router;