const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    eventType: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventName: { type: String, required: true },
    officiantName: { type: String, required: true },
    officiantId: { type: String, required: true },
    cost: { type: Number, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    eventId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", BillSchema);
