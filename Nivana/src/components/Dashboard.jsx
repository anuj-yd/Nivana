import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const displayName = auth.user?.fullName ? auth.user.fullName.split(' ')[0] : 'Sunshine';
  
  // State Variables
  const [mood, setMood] = useState("");
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [badges, setBadges] = useState([]); 
  const [toast, setToast] = useState(null); 
  const [modalOpen, setModalOpen] = useState(false);
  const [weeklyMoodData, setWeeklyMoodData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wellness Status Badge State
  const [wellnessStatus, setWellnessStatus] = useState({ 
    label: "Checking...", 
    color: "bg-gray-100 text-gray-500", 
    icon: "⏳" 
  });

  // 5 Focus Areas State
  const [improvementAreas, setImprovementAreas] = useState([
    { area: "Sleep Quality", progress: 0, color: "bg-gray-200" },
    { area: "Mental Focus", progress: 0, color: "bg-gray-200" },
    { area: "Social Connection", progress: 0, color: "bg-gray-200" },
    { area: "Emotional Balance", progress: 0, color: "bg-gray-200" },
    { area: "Stress Control", progress: 0, color: "bg-gray-200" },
  ]);

  // 🔐 TOKEN GUARD
  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  const moods = [
    { emoji: "🌟", label: "Great", value: "great", bg: "bg-[var(--joy-sunshine)]/30" },
    { emoji: "😊", label: "Good", value: "good", bg: "bg-teal-300/50" },
    { emoji: "🌤️", label: "Okay", value: "okay", bg: "bg-teal-200/40" },
    { emoji: "🌧️", label: "Low", value: "low", bg: "bg-green-300/50" },
    { emoji: "🌪️", label: "Rough", value: "rough", bg: "bg-green-200/40" },
  ];

  const quickActions = [
    {
      icon: "🧘",
      title: "Quick Calm",
      description: "2-minute breathing exercise",
      path: "/breathing",
      gradient: true,
      style: "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-[var(--shadow-soft)]",
    },
    {
      icon: "📝",
      title: "Journal",
      description: "Reflect on your day",
      path: "/journal",
      gradient: false,
      style: "bg-white/80 shadow-[var(--shadow-soft)] border border-black/10",
    },
    {
      icon: "🎧",
      title: "Meditation",
      description: "Guided audio practice",
      path: "/meditation",
      gradient: false,
      style: "bg-white/80 shadow-[var(--shadow-soft)] border border-black/10",
    },
  ];

  const navItems = [
    { icon: "🏠", label: "Home", to: "/dashboard" },
    { icon: "🧠", label: "Assessments", to: "/assessments" },
    { icon: "📜", label: "History", to: "/history" },
    { icon: "💡", label: "Guidance", to: "/guidance" },
    { icon: "👤", label: "Profile", to: "/profile" },
  ];

  // ---------------------------------------------------------
  // 1. LOGIC: Risk Level -> Badge UI
  // ---------------------------------------------------------
  const getSeverityUI = (riskLevel) => {
    if (!riskLevel) return { label: "Start Assessment", color: "bg-gray-100 text-gray-500", icon: "📋" };
    
    const level = riskLevel.toLowerCase();

    switch(level) {
      case "low":
        return { label: "Thriving", color: "bg-green-100 text-green-700 border border-green-200", icon: "🌿" };
      case "moderate":
        return { label: "Healing Phase", color: "bg-yellow-50 text-yellow-700 border border-yellow-200", icon: "🚧" };
      case "high":
        return { label: "Needs Care", color: "bg-orange-50 text-orange-700 border border-orange-200", icon: "⚠️" };
      case "severe":
        return { label: "Seek Support", color: "bg-red-50 text-red-700 border border-red-200", icon: "🆘" };
      default:
        return { label: "Analyzing...", color: "bg-blue-50 text-blue-700", icon: "🤔" };
    }
  };

  // ---------------------------------------------------------
  // 2. LOGIC: AI Scores -> 5 Progress Bars
  // ---------------------------------------------------------
  const computeImprovementAreasFromAssessment = (assessment) => {
    if (!assessment) return [
        { area: "Sleep Quality", progress: 0, color: "bg-gray-200" },
        { area: "Mental Focus", progress: 0, color: "bg-gray-200" },
        { area: "Social Connection", progress: 0, color: "bg-gray-200" },
        { area: "Emotional Balance", progress: 0, color: "bg-gray-200" },
        { area: "Stress Control", progress: 0, color: "bg-gray-200" },
    ];

    const scores = assessment.llmAnalysis?.scores || {};
    
    const sleepVal = scores.sleep || (assessment.sleep ? (assessment.sleep/5)*100 : 50);
    const focusVal = scores.focus || (assessment.moodScore ? assessment.moodScore*10 : 50);
    const socialVal = scores.social || 50;
    const depressionScore = scores.depression || 50;
    const emotionalVal = 100 - depressionScore;
    const anxietyScore = scores.anxiety || 50;
    const stressVal = 100 - anxietyScore;

    const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
    const getColor = (val) => val < 40 ? "bg-red-500" : val < 75 ? "bg-yellow-500" : "bg-green-500";

    return [
      { area: "Sleep Quality", progress: clamp(sleepVal), color: getColor(sleepVal) },
      { area: "Mental Focus", progress: clamp(focusVal), color: getColor(focusVal) },
      { area: "Social Connection", progress: clamp(socialVal), color: getColor(socialVal) },
      { area: "Emotional Balance", progress: clamp(emotionalVal), color: getColor(emotionalVal) },
      { area: "Stress Control", progress: clamp(stressVal), color: getColor(stressVal) },
    ];
  };

  const thresholds = [
    { days: 7, id: "weekly", title: "Weekly Warrior", msg: "7-day streak! Keep that momentum 🔥", emoji: "🔥", color: "bg-yellow-100 text-yellow-800" },
    { days: 30, id: "monthly", title: "Monthly Master", msg: "30-day streak! Incredible commitment 🌟", emoji: "🌟", color: "bg-green-100 text-green-800" },
    { days: 365, id: "yearly", title: "Yearly Sage", msg: "365-day streak! Legendary consistency 🏆", emoji: "🏆", color: "bg-purple-100 text-purple-800" },
  ];

  const navLinkBase = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-black/60";

  // ---------- 🔥 REFRESH DASHBOARD (FIXED & DEBUGGED) ----------
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      const token = auth.token;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Dashboard fetch failed");

      const data = await res.json();
      
      // 🕵️ DEBUGGING: Console (F12) mein dekhein
      console.log("🔥 FULL API RESPONSE:", data);
      console.log("🔥 RAW STREAK DATA:", data.streak);

      // --- 🛠️ BULLETPROOF STREAK PARSING ---
      let finalStreak = 0;
      let finalLongest = 0;
      let finalBadges = [];

      // Case A: Agar streak object hai (Normal Data: { current: 1 })
      if (data.streak && typeof data.streak === 'object') {
         finalStreak = data.streak.current || 0;
         finalLongest = data.streak.longest || 0;
         finalBadges = data.streak.badges || [];
      } 
      // Case B: Agar streak seedha number hai (Test/Flat Data: 5)
      else if (typeof data.streak === 'number') {
         finalStreak = data.streak;
         finalLongest = data.streak; // Fallback
      }
      // Case C: Agar 'currentStreak' key hai
      else if (data.currentStreak) {
         finalStreak = data.currentStreak;
      }

      console.log("✅ FINAL CALCULATED STREAK:", finalStreak);

      setStreak(Number(finalStreak));
      setLongest(Number(finalLongest));
      setBadges(finalBadges);

      // Graph Data
      setWeeklyMoodData(
        (data.weeklyMood || []).map((d) => ({
          day: d.day,
          moodScore: d.score,
        }))
      );
      
      // Focus Areas Update
      setImprovementAreas(computeImprovementAreasFromAssessment(data.latestAssessment));

      // Wellness Badge Update
      const risk = data.latestAssessment?.llmAnalysis?.riskLevel || data.latestAssessment?.severity || null;
      setWellnessStatus(getSeverityUI(risk));

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isLoading) return;
    refreshDashboard();
  }, [auth.isLoading, auth.token, location.key]);

  // Listen for `assessment:saved` events
  useEffect(() => {
    const handler = (e) => {
      const saved = e?.detail;
      if (!saved) {
        refreshDashboard();
        return;
      }
      refreshDashboard();
    };

    window.addEventListener('assessment:saved', handler);
    return () => window.removeEventListener('assessment:saved', handler);
  }, [auth.token]);

  // If navigation brought back a savedAssessment
  useEffect(() => {
    const saved = location.state?.savedAssessment;
    if (!saved) return;
    try {
        setToast({ title: 'Assessment saved', msg: 'Your wellness profile has been updated.' });
        setTimeout(() => setToast(null), 3500);
        refreshDashboard();
        navigate(location.pathname, { replace: true, state: {} });
    } catch (e) {
        console.warn("Error handling saved assessment state", e);
    }
  }, [location.state?.savedAssessment]);

  const handleLogout = () => {
    try {
      auth.logout();
    } catch (e) {
      console.warn("Could not clear auth on logout", e);
    }
    navigate("/login", { replace: true });
  };

  const openStreakModal = () => setModalOpen(true);
  const closeStreakModal = () => setModalOpen(false);

  const getMoodScore = (moodValue) => {
    switch (moodValue) {
      case "great": return 10;
      case "good": return 8;
      case "okay": return 6;
      case "low": return 4;
      case "rough": return 2;
      default: return 5;
    }
  };

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/moods`, {
        method: "POST",
        headers: {
          // ✅ FIX 1: Content-Type Header correct kiya
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          score: getMoodScore(selectedMood),
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Mood Save Success:", data);

        setToast({ title: "Mood Logged", msg: "Added to your history" });
        setTimeout(() => setToast(null), 3000);
        refreshDashboard();
      } else {
        // ✅ FIX 2: Error JSON body se read karna
        const errorData = await res.json().catch(() => ({ msg: "Server reported failure" }));
        throw new Error(errorData.msg || "Failed to save");
      }
    } catch (err) {
      console.error("Mood Select Error:", err.message);
      // ✅ FIX 3: Frontend error handling ko robust banana
      setToast({ 
            title: "Error", 
            msg: err.message.includes("Could not save") || err.message.includes("Server reported failure")
                ? "Could not save mood. Check server logs." 
                : err.message 
        });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden relative">
      {/* TOAST */}
      {toast && (
        <div className="fixed right-6 top-6 z-50">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-4 py-3 rounded-xl bg-white/95 shadow-[var(--shadow-soft)] border border-black/5"
          >
            <div className="font-semibold">{toast.title}</div>
            <div className="text-sm text-black/60">{toast.msg}</div>
          </motion.div>
        </div>
      )}

      {/* STREAK MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeStreakModal} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-xl p-6 rounded-2xl bg-white/95 shadow-[var(--shadow-float)] border border-black/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Achievements</h2>
                <p className="text-sm text-black/60 mt-1">Your streak progress and longest streak</p>
              </div>
              <button onClick={closeStreakModal} className="text-sm px-3 py-1 rounded-lg bg-black/5">✕</button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-black/50">Current Streak</div>
                  {/* 🔥 DISPLAYING STREAK HERE */}
                  <div className="text-2xl font-bold">{streak} day{streak !== 1 ? "s" : ""}</div>
                </div>
                <div className="text-3xl">🔥</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-black/50">Longest Streak</div>
                  <div className="text-2xl font-bold">{longest} day{longest !== 1 ? "s" : ""}</div>
                </div>
                <div className="text-3xl">🏅</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/10">
                <div className="text-sm font-medium mb-2">Badges</div>
                <div className="flex gap-2 flex-wrap">
                  {thresholds.map((t) => {
                    const earned = badges.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 ${
                          earned ? "bg-green-100 text-green-800" : "bg-black/5 text-black/40"
                        }`}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.title}</span>
                        {!earned && <span className="text-xs text-black/40">({t.days}d)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="nature-blob -top-32 -right-32 w-96 h-96 bg-green-300/30"></div>
        <div className="nature-blob top-1/4 -left-20 w-80 h-80 bg-teal-300/20"></div>
        <div className="nature-blob bottom-1/3 right-1/4 w-72 h-72 bg-yellow-200/20"></div>
      </div>

      {/* SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 w-64 h-screen flex-col p-6 bg-white/80 backdrop-blur-xl border-r border-green-300/30 shadow-[var(--shadow-soft)] overflow-y-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-[var(--shadow-soft)] bg-gradient-to-br from-green-400 to-green-600">
            🌿
          </div>
          <div>
            <div className="font-semibold text-lg">Mindnest</div>
            <div className="text-xs text-black/50">Wellness Hub</div>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `${navLinkBase} ${
                  isActive
                    ? "text-[var(--foreground)] bg-green-300/30 shadow-[var(--shadow-float)]"
                    : "hover:text-[var(--foreground)] hover:bg-green-300/20"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-float)] transition-all"
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="md:ml-64 p-6 md:p-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="text-sm text-black/50">Welcome back,</div>
            <h1 className="text-4xl font-bold">
              Hello, <span className="joy-gradient-text">{displayName}</span> ☀️
            </h1>
          </div>

          {/* STREAK + WELLNESS BADGE */}
          <div className="flex items-center gap-3">
            {/* 🔥 WELLNESS STATUS BADGE */}
            {wellnessStatus.label !== "No Data" && (
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-[var(--shadow-soft)] transition-all ${wellnessStatus.color}`}>
                    <span className="text-lg">{wellnessStatus.icon}</span>
                    <span className="text-sm">{wellnessStatus.label}</span>
                </div>
            )}

            <button
              onClick={openStreakModal}
              className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-xl border border-black/5 shadow-[var(--shadow-soft)] hover:scale-105 transition-transform"
            >
              <div className="text-xl">🔥</div>
              {/* 🔥 DISPLAYING STREAK HERE */}
              <div className="text-sm font-semibold">{streak}</div>
            </button>
          </div>
        </div>

        {/* MOOD SELECTOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[2rem] bg-white/80 shadow-[var(--shadow-soft)] backdrop-blur-xl border border-black/10 mb-8"
        >
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">How are you feeling today?</h2>
              <p className="text-sm text-black/50">Your mood shapes your day</p>
            </div>
            <span className="text-4xl">🌸</span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => handleMoodSelect(m.value)}
                className={`
                  p-4 rounded-2xl transition-all border-2
                  ${m.bg}
                  ${
                    mood === m.value
                      ? "border-green-500 shadow-[var(--shadow-float)] scale-105"
                      : "border-white/30 hover:border-green-400/50 hover:scale-105"
                  }
                `}
              >
                <div className="text-3xl mb-2">{m.emoji}</div>
                <div className="text-xs font-semibold text-green-700">{m.label}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* QUICK ACTIONS + GRAPHS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* CHARTS */}
          <div className="lg:col-span-2 grid grid-rows-2 gap-6">
            {/* Mood Line Chart */}
            <div className="p-6 rounded-[2rem] bg-white/80 shadow-[var(--shadow-soft)] border border-black/10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Mood Over Time</h3>
                  <p className="text-xs text-black/50">Last 7 days</p>
                </div>
                <div className="text-sm text-black/50">Stable ↑</div>
              </div>

              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyMoodData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="moodScore"
                      stroke="#4ade80"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* IMPROVEMENT AREAS (5 PILLARS) */}
            <div className="p-6 rounded-[2rem] bg-white/80 shadow-[var(--shadow-soft)] border border-black/10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Focus Areas & Balance</h3>
                  <p className="text-xs text-black/50">AI analysis from latest assessment</p>
                </div>
                <div className="text-sm text-black/50">Health Score</div>
              </div>

              <div className="space-y-4">
                {improvementAreas.map((it) => (
                  <div key={it.area}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{it.area}</span>
                        <span className="text-xs font-bold text-gray-500">{it.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        {/* ANIMATED COLOR BAR */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${it.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${it.color}`}
                        />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="p-6 rounded-[2rem] bg-white/80 shadow-[var(--shadow-soft)] border border-black/10">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className={`p-4 rounded-xl text-left transition-all ${action.style} hover:scale-[1.02] active:scale-95`}
                >
                  <div className="text-2xl mb-1">{action.icon}</div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}