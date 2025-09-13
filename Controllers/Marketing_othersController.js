const subscriber = require("../Models/Markteting_others_Schema");

// Add a new subscriber from home page
exports.addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    // Check if email already exists
    const existingSubscriber = await subscriber.findOne({ email });
    console.log("Existing subscriber check:", existingSubscriber);
    if (existingSubscriber) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // Create new subscriber
    const newSubscriber = new subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Error adding subscriber:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all user list for officiants
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await subscriber.find().sort({ submittedAt: -1 });
        res.status(200).json(subscribers);
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
