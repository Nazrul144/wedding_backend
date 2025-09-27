const Bill = require("../Models/BillSchema");
const event = require("../Models/EventSchema");
const { createNotification } = require("./notificationController");


// ===============Create a Bill ===============
exports.createBill = async (req, res) => {
    try {
        const newBill = new Bill(req.body);
        console.log(req.body);
        const associatedEvent = await event.findById(req.body.eventId);
        if (!associatedEvent) {
            return res.status(404).json({ message: "Associated event not found" });
        }
        associatedEvent.status = "completed";
        associatedEvent.price = req.body.amount;
     await createNotification(
       req.body.officiantId,
       "bill",
       `payment received from ${req.body.userName} on ${req.body.eventName}.`
     );
     await createNotification(
       req.body.userId,
       "bill",
       `payment made to ${req.body.officiantName} on ${req.body.eventName}.`
     );


        await associatedEvent.save();
        await newBill.save();
        res.status(201).json({ message: "Bill created successfully", bill: newBill });
    } catch (error) {
        res.status(500).json({ message: "Error creating bill", error });
    }
};
// ===============Get All Bills ===============
exports.getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find();
        res.status(200).json({ message: "Bills retrieved successfully", bills });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving bills", error });
    }
};

// ===============Get Bill by ID ===============
exports.getBillById = async (req, res) => {
    try {
        console.log("Fetching bill with ID:", req.params.id);
        const bill = await Bill.findOne({eventId: req.params.id.toString()});
        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }
        res.status(200).json({ message: "Bill retrieved successfully", bill });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving bill", error });
    }
};

// ===============Update Bill Status ===============
exports.updateBillStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const bill = await Bill.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }
        res.status(200).json({ message: "Bill status updated successfully", bill });
    } catch (error) {
        res.status(500).json({ message: "Error updating bill status", error });
    }
};

