const e = require("express");
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ceremonyType: { type: String, required: true },
    vowsType: { type: String, required: false },  
    language: { type: String, required: false },
    vowDescription: { type: String, required: false },
    rituals: { type: String, required: false },
    musicCues: { type: String, required: false },
    ritualsDescription: { type: String, required: false },
    eventDate: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: { type: String,  required: true },
    officiantId: { type: String,  required: false },
    officiantName: { type: String,  required: false },
    rehearsalDate: { type: Date, required: false },
    
    location: { type: String, required: false },
    eventTime: { type: Date, required: false },
    status: { type: String, enum: ["planned", "submitted", "approved", "completed", "canceled"], default: "planned" },

});


module.exports = mongoose.model("Event", EventSchema);
