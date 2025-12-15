const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Counter ka naam (jaise 'userId')
  seq: { type: Number, default: 0 }     // Ginti (0 se shuru hogi)
});

module.exports = mongoose.model("Counter", counterSchema);