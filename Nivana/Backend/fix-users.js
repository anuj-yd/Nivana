const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

// Models import kar rahe hain
const User = require("./models/User");
const Counter = require("./models/Counter");

const runFix = async () => {
  try {
    // 1. Database Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database Connected...");

    // 2. Counter reset karo (Safai)
    await Counter.deleteMany({ id: "userId" });

    // 3. Purane users dhundo
    const users = await User.find({}).sort({ createdAt: 1 });
    console.log(`🔍 Total Users Mile: ${users.length}`);

    let count = 0;
    
    // 4. Sabko number assign karo
    for (const user of users) {
      count++;
      // Direct database update taaki koi conflict na ho
      await User.updateOne(
        { _id: user._id }, 
        { $set: { userId: count } }
      );
      console.log(`✅ Fixed: ${user.fullName} -> userId: ${count}`);
    }

    // 5. Counter ko last number par set karo
    await new Counter({ id: "userId", seq: count }).save();

    console.log("🎉 MIGRATION COMPLETE! Ab naya account banaoge to userId sahi aayega.");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

runFix();