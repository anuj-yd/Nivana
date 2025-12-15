const path = require("path");
// ✅ FIX: .env file ka pakka path set kiya taaki API Key load ho jaye
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
app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Serve Static Files (Uploaded Images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "some_session_secret",
    resave: false,
    saveUninitialized: false,
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
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// -- GITHUB STRATEGY --
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/github/callback`,
    },
    async (_, __, profile, done) => {
      try {
        const User = mongoose.model("User");
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            fullName: profile.displayName || profile.username,
            email,
            provider: "github",
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

app.use("/api/auth", require("./routes/auth"));
app.use("/api/assessments", require("./routes/assessments"));

// Dashboard Route
app.use("/api/dashboard", require("./middleware/auth"), require("./routes/dashboard"));

// Mood Routes
app.use("/api/moods", require("./routes/mood"));


/* ---------------------- OAUTH CALLBACK ROUTES ---------------------- */

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  }
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  }
);

/* ---------------------- HEALTH CHECK ---------------------- */
app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ---------------------- START SERVER ---------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);