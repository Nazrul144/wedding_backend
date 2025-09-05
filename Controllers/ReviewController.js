const review = require("./../Models/Review");


// Create a riview for an event
exports.createReview = async (req, res) => {
  try {
    const {
      userId,
      userImageUrl,
      userName,
      rating,
      eventId,
      ratingDescription,
      officiantId,
      eventName,
    } = req.body;
    if (
      !userId ||
      !userImageUrl ||
      !userName ||
      !rating ||
      !eventId ||
      !officiantId ||
      !eventName
    ) {
      return res
        .status(400)
        .json({ msg: "All fields are required except rating description" });
    }
    const newReview = new review({
      userId,
      userImageUrl,
      userName,
      rating,
      eventId,
      ratingDescription,
      officiantId,
      eventName,
    });
    await newReview.save();
    res
      .status(201)
      .json({ msg: "Review created successfully", review: newReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get reviews for officiants
exports.getReviewsForOfficiant = async (req, res) => {
  try {
    const { officiantId } = req.params;
    if (!officiantId) {
      return res.status(400).json({ msg: "Officiant ID is required" });
    }
    const reviews = await review.find({ officiantId });
    res.status(200).json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update review visibility
exports.updateReviewVisibility = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { isVisible } = req.body;
        console.log("Updating review visibility:", { reviewId, isVisible });
        if (isVisible === undefined) {
            return res.status(400).json({ msg: "Visibility status is required" });
        }
        const updatedReview = await review.findByIdAndUpdate(
            reviewId,
            { isVisible },
            { new: true, runValidators: true }
        );
        if (!updatedReview) {
            return res.status(404).json({ msg: "Review not found" });
        }
        res.status(200).json({ msg: "Review visibility updated successfully", review: updatedReview });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

