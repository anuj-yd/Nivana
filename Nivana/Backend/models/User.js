const mongoose = require("mongoose");
const Counter = require("./Counter");

const userSchema = new mongoose.Schema({
  // 1. userId (Auto-Increment)
  userId: {
    type: Number,
    unique: true,
    sparse: true 
  },

  // --- Baaki Fields ---
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false 
  },
  provider: {
    type: String,
    default: "local"
  },
  profileImage: {
    type: String,
    default: ""
  },

  // ✅ NEW FIELDS FOR FORGOT PASSWORD
  resetPasswordToken: String,
  resetPasswordExpire: Date

}, { timestamps: true });


// ✅ FIXED MAGIC LOGIC (Auto-Increment)
userSchema.pre("save", async function () {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "userId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.userId = counter.seq;
    } catch (error) {
      throw error;
    }
  }
});

module.exports = mongoose.model("User", userSchema);