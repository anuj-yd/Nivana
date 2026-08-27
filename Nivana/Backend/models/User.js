const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ✅ Counter Model Import (Path check kar lena)
const Counter = require("./Counter"); 

const UserSchema = new mongoose.Schema({
  // ✅ CUSTOM USER ID (Auto-Increment)
  userId: {
    type: Number,
    unique: true, // Sabka alag hoga
  },

  fullName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    // ✅ Password sirf local users ke liye required
    required: function () {
      return this.provider === "local";
    },
  },

  provider: {
    type: String,
    default: "local", // local | google
  },


  profileImage: {
    type: String,
    default: "",
  },

  streak: {
  current: { type: Number, default: 0 },
  longest: { type: Number, default: 0 },
  badges: { type: [String], default: [] }
},

// 🔥 LAST ACTIVE DATE (no auto default)
lastLoginDate: {
  type: Date
},

resetPasswordToken: {
  type: String,
},
resetPasswordExpire: {
  type: Date,
},

createdAt: {
    type: Date,
    default: Date.now,
  },
});

// =======================================================
// ✅ PRE-SAVE HOOK (Auto-Increment + Password Hash)
// =======================================================
UserSchema.pre("save", async function (next) {
  const user = this;

  // ---------------------------------------------
  // 1️⃣ AUTO INCREMENT LOGIC (Sirf New Users ke liye)
  // ---------------------------------------------
  if (user.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "userId" },        // Counter ka naam
        { $inc: { seq: 1 } },    // Value +1 badhao
        { new: true, upsert: true } // Agar nahi hai to bana do
      );
      user.userId = counter.seq; // Naya number user ko dedo
    } catch (error) {
      console.error("❌ Counter Error:", error);
      return next(error); // Save hone se rok do agar counter fail ho
    }
  }

  // ---------------------------------------------
  // 2️⃣ PASSWORD HASH LOGIC
  // ---------------------------------------------
  // Agar password modify nahi hua ya password hai hi nahi (OAuth), to return
  if (!user.isModified("password") || !user.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    console.error("❌ Hashing Error:", error);
    next(error);
  }
});

// =======================================================
// ✅ PASSWORD MATCH METHOD
// =======================================================
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);