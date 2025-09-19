const express= require("express");
const auth = require("../Middleware/authMiddleware");
const router = express.Router();
const {addSubscriber, getAllSubscribers}= require("./../Controllers/Marketing_othersController");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add a new subscriber from home page
router.post("/subscribe", addSubscriber);

// get all user list for officiants
router.get("/subscribers", auth, getAllSubscribers);


// =======================Payment Api====================
router.post('/create-checkout-session', auth, async (req, res) => {
const { Price } = req.body;
const amount = Price * 100; // convert to cents

try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method_types: ["card"],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
} catch (error) {
  console.error("Error creating payment intent:", error);
  res.status(500).send({ error: "Error creating payment intent" });
}
})


module.exports = router;
