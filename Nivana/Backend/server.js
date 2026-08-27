const path = require("path");
// ✅ .env file load
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

/* ---------------------- CONFIG ---------------------- */
// Render par FRONTEND_URL set hona chahiye: https://nivana.vercel.app
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

console.log("🚀 Server Config:", { FRONTEND_URL, BACKEND_URL });

/* ---------------------- MIDDLEWARE ---------------------- */
app.use(express.json()); // Body Parser

// ✅ CORS Settings (Crucial for Vercel connection)
app.use(
  cors({
    origin: FRONTEND_URL, // Sirf aapke Frontend ko allow karega
    credentials: true,    // Cookies/Headers allow karne ke liye
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve Static Files (Uploaded Images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ Session Config (Passport ko init karne ke liye zaroori hai)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key_nivana",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Live par HTTPS zaroori
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(passport.initialize());
// app.use(passport.session()); // Session storage skip kar rahe hain kyunki JWT use ho raha hai

/* ---------------------- DB CONNECTION ---------------------- */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if DB doesn't connect
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.log("❌ MongoDB Connection Error:", err.message);
    console.log("👉 TIP: If you see a timeout error, ensure your IP address (or 0.0.0.0/0 for anywhere) is whitelisted in MongoDB Atlas Network Access!");
  }
};

connectDB();

/* ---------------------- MODELS ---------------------- */
require("./models/User"); 
require("./models/Assessment");
require("./models/Mood");

/* ---------------------- PASSPORT STRATEGIES ---------------------- */

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const User = mongoose.model("User");
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 👉 1. Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // 🔥 Callback URL me '/api' add kiya hai
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (_, __, profile, done) => {
      try {
        const User = mongoose.model("User");
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        
        if (!user) {
          user = await User.create({
            fullName: profile.displayName,
            email,
            provider: "google",
            googleId: profile.id
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);



/* ---------------------- ROUTES ---------------------- */

// ✅ Saare Auth Routes yahan handle honge 
// (Login, Signup, Google sab iske andar hain)
app.use("/api/auth", require("./routes/auth"));

// Other Routes
app.use("/api/assessments", require("./routes/assessments"));
app.use("/api/dashboard", require("./middleware/auth"), require("./routes/dashboard"));
app.use("/api/moods", require("./routes/mood"));
app.use("/api/laughter", require("./routes/laughter"));

// Health Check
app.get("/api/health", (req, res) => res.json({ ok: true, msg: "Server is running 🚀" }));

/* ---------------------- ERROR HANDLING ---------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Global Server Error:", err.stack);
  res.status(500).json({ msg: "Internal Server Error", error: err.message });
});

/* ---------------------- START SERVER ---------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on Port: ${PORT}`)
);