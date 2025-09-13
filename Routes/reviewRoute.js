const express = require("express");
const auth = require("../Middleware/authMiddleware");
const { createReview, getReviewsForOfficiant, updateReviewVisibility, getPublicReviews, getPublicReviewsForOfficiant } = require("../Controllers/ReviewController");
const router = express.Router();

// Creating a review
router.post("/create", auth, createReview);

// Get reviews for officiants
router.get("/officiant/:officiantId", auth, getReviewsForOfficiant);


// Update review visibility
router.patch("/visibility/:reviewId", auth, updateReviewVisibility);

// Get public reviews
router.get("/public", getPublicReviews);

// get public reviews of an officiant
router.get("/public/:officiantId", getPublicReviewsForOfficiant);

module.exports = router;