const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // --- Basic Fields ---
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
    required: true 
  },
  
  profileImage: { 
    type: String, 
    default: "" 
  },

  // --- Streak & Login Tracking ---
  // Default 1 rakha hai taaki naya user 0 par na ho
  streak: {
    current: { type: Number, default: 1 }, 
    longest: { type: Number, default: 1 },
    badges: { type: [String], default: [] }
  },

  lastLoginDate: { 
    type: Date, 
    default: Date.now 
  },

  // --- Forgot Password Fields ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);