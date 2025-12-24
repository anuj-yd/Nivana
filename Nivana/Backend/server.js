const path = require("path");
// ✅ FIX: .env file ka pakka path set kiya
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");

const app = express();

/* ---------------------- CONFIG ---------------------- */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Debugging: Check if Key is loaded
console.log("🔑 API Key Status:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "MISSING ❌");

/* ---------------------- MIDDLEWARE ---------------------- */
app.use(express.json()); // Body parser

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// Serve Static Files (Uploaded Images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "some_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ---------------------- DB CONNECTION ---------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

/* ---------------------- MODELS ---------------------- */
// ✅ Models yaha load ho rahe hain
require("./models/User");
require("./models/Assessment");
require("./models/Mood");

/* ---------------------- PASSPORT CONFIG ---------------------- */
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

// -- GOOGLE STRATEGY --
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
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
            googleId: profile.id // Optional: Future proofing ke liye save kar sakte hain
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// -- GITHUB STRATEGY (UPDATED & FIXED) --
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/github/callback`,
      scope: ['user:email'] // Email access maangna zaroori hai
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const User = mongoose.model("User");

        // 1. STEP 1: GitHub ID se check karo (Sabse Accurate)
        // Note: Apne User Model me 'githubId' field zaroor add karna
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user); // Existing GitHub user -> Login
        }

        // 2. STEP 2: Agar ID nahi mili, to Email se check karo (Merge Logic)
        // GitHub array of emails bhejta hai, primary wala dhundo
        let email = profile.emails && profile.emails.length > 0 
                    ? (profile.emails.find(e => e.primary) || profile.emails[0]).value 
                    : null;

        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // User mil gaya! Ab isme githubId save kar do (Account Merged)
            user.githubId = profile.id;
            // user.provider = "github"; // Provider overwrite mat karna agar wo pehle se google/email tha
            await user.save();
            return done(null, user);
          }
        }

        // 3. STEP 3: Create New User (Agar na ID mili, na Email)
        const finalEmail = email || `${profile.username}@github.local`; // Fallback only if email hidden

        user = await User.create({
          fullName: profile.displayName || profile.username,
          email: finalEmail,
          provider: "github",
          githubId: profile.id, // 🔥 IMPORTANT: Ye save karna zaroori hai for next login
        });

        done(null, user);
      } catch (err) {
        console.error("GitHub Auth Error:", err);
        done(err, null);
      }
    }
  )
);

/* ---------------------- ROUTES ---------------------- */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/assessments", require("./routes/assessments"));

// Dashboard Route
app.use("/api/dashboard", require("./middleware/auth"), require("./routes/dashboard"));

// Mood Routes
app.use("/api/moods", require("./routes/mood"));
app.use("/api/laughter", require("./routes/laughter"));


/* ---------------------- OAUTH CALLBACK ROUTES ---------------------- */

// Google
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// GitHub
app.get(
  "/api/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  }
);

/* ---------------------- HEALTH CHECK ---------------------- */
app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ---------------------- GLOBAL ERROR HANDLER ---------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error Stack:", err.stack);
  res.status(500).json({ 
    msg: "Internal Server Error", 
    error: err.message || "Something went wrong on the server" 
  });
});

/* ---------------------- START SERVER ---------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);