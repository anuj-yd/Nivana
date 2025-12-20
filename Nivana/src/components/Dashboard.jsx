import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api"; 

// ✅ UPDATED RECHARTS IMPORTS (Added Radar components)
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ✅ HARDCODED URL (Matches your setup)
const API_URL = "http://localhost:5000/api";

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

  // ✅ NEW: View Mode for Focus Areas (List vs Graph)
  const [viewMode, setViewMode] = useState("list"); 

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

  // ✨ CUSTOM TOOLTIP COMPONENT FOR MOOD GRAPH
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[var(--shadow-float)] border border-green-100 text-center">
          <p className="text-sm font-bold text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-bold text-green-600">
            Mood: {payload[0].value}/10
          </p>
          <div className="text-xs text-green-800/60 font-medium mt-1">
             {payload[0].value >= 8 ? "🌟 Amazing!" : payload[0].value >= 5 ? "😊 Doing Good" : "🌧️ Tough Day"}
          </div>
        </div>
      );
    }
    return null;
  };

  // ✅ NEW: Helper for Focus Area Icons & Insights
  const getAreaDetails = (area, score) => {
    const details = {
      "Sleep Quality": { icon: "😴", low: "prioritizing rest", high: "Great recovery" },
      "Mental Focus": { icon: "🧠", low: "taking brain breaks", high: "Sharp focus" },
      "Social Connection": { icon: "🤝", low: "calling a friend", high: "Well connected" },
      "Emotional Balance": { icon: "❤️", low: "mindfulness practice", high: "Emotionally stable" },
      "Stress Control": { icon: "🍃", low: "breathing exercises", high: "Calm & Collected" },
    };
    
    const meta = details[area] || { icon: "✨", low: "care", high: "doing well" };
    let insight = "";
    
    if (score < 40) insight = `Try ${meta.low}`;
    else if (score < 75) insight = "Improving";
    else insight = meta.high;

    return { icon: meta.icon, insight };
  };

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

  const getSeverityUI = (riskLevel) => {
    if (!riskLevel) return { label: "Start Assessment", color: "bg-gray-100 text-gray-500", icon: "📋" };
    const level = riskLevel.toLowerCase();
    switch(level) {
      case "low": return { label: "Thriving", color: "bg-green-100 text-green-700 border border-green-200", icon: "🌿" };
      case "moderate": return { label: "Healing Phase", color: "bg-yellow-50 text-yellow-700 border border-yellow-200", icon: "🚧" };
      case "high": return { label: "Needs Care", color: "bg-orange-50 text-orange-700 border border-orange-200", icon: "⚠️" };
      case "severe": return { label: "Seek Support", color: "bg-red-50 text-red-700 border border-red-200", icon: "🆘" };
      default: return { label: "Analyzing...", color: "bg-blue-50 text-blue-700", icon: "🤔" };
    }
  };

  // Logic to handle Zero or Real Data
  const computeImprovementAreasFromAssessment = (assessment) => {
    if (!assessment || !assessment.llmAnalysis || !assessment.llmAnalysis.scores) {
        return [
            { area: "Sleep Quality", progress: 0, color: "bg-gray-200" },
            { area: "Mental Focus", progress: 0, color: "bg-gray-200" },
            { area: "Social Connection", progress: 0, color: "bg-gray-200" },
            { area: "Emotional Balance", progress: 0, color: "bg-gray-200" },
            { area: "Stress Control", progress: 0, color: "bg-gray-200" },
        ];
    }

    const scores = assessment.llmAnalysis.scores;

    // Logic: Problem Score -> Health Score (100 - Problem)
    const getHealthScore = (problemScore) => {
        const val = Number(problemScore) || 0;
        return Math.max(0, Math.min(100, 100 - val));
    };

    const sleepVal = getHealthScore(scores.sleep);
    const focusVal = getHealthScore(scores.focus);
    const socialVal = getHealthScore(scores.social);
    const emotionalVal = getHealthScore(scores.depression);
    const stressVal = getHealthScore(scores.anxiety);

    const getColor = (val) => val < 40 ? "bg-red-500" : val < 75 ? "bg-yellow-500" : "bg-green-500";

    return [
      { area: "Sleep Quality", progress: sleepVal, color: getColor(sleepVal) },
      { area: "Mental Focus", progress: focusVal, color: getColor(focusVal) },
      { area: "Social Connection", progress: socialVal, color: getColor(socialVal) },
      { area: "Emotional Balance", progress: emotionalVal, color: getColor(emotionalVal) },
      { area: "Stress Control", progress: stressVal, color: getColor(stressVal) },
    ];
  };

  const thresholds = [
    { days: 7, id: "weekly", title: "Weekly Warrior", msg: "7-day streak! Keep that momentum 🔥", emoji: "🔥", color: "bg-yellow-100 text-yellow-800" },
    { days: 30, id: "monthly", title: "Monthly Master", msg: "30-day streak! Incredible commitment 🌟", emoji: "🌟", color: "bg-green-100 text-green-800" },
    { days: 365, id: "yearly", title: "Yearly Sage", msg: "365-day streak! Legendary consistency 🏆", emoji: "🏆", color: "bg-purple-100 text-purple-800" },
  ];

  const navLinkBase = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-black/60";

  // ---------- 🔥 REFRESH DASHBOARD ----------
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      const token = auth.token;
      if (!token) return; 

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); 

      const res = await fetch(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Dashboard fetch failed");

      const data = await res.json();
      
      let finalStreak = 0;
      let finalLongest = 0;
      let finalBadges = [];

      if (data.streak && typeof data.streak === 'object') {
         finalStreak = data.streak.current || 0;
         finalLongest = data.streak.longest || 0;
         finalBadges = data.streak.badges || [];
      } else if (typeof data.streak === 'number') {
         finalStreak = data.streak;
         finalLongest = data.streak;
      } else if (data.currentStreak) {
         finalStreak = data.currentStreak;
      }

      setStreak(Number(finalStreak));
      setLongest(Number(finalLongest));
      setBadges(finalBadges);
      setWeeklyMoodData((data.weeklyMood || []).map((d) => ({ day: d.day, moodScore: d.score })));
      
      setImprovementAreas(computeImprovementAreasFromAssessment(data.latestAssessment));
      
      const risk = data.latestAssessment?.llmAnalysis?.riskLevel || data.latestAssessment?.severity || null;
      setWellnessStatus(getSeverityUI(risk));

    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.name === 'AbortError') {
         setToast({ title: "Network Slow", msg: "Taking longer than usual..." });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isLoading) return;
    if (auth.isAuthenticated) refreshDashboard();
  }, [auth.isLoading, auth.isAuthenticated, location.key]);

  useEffect(() => {
    const handler = (e) => refreshDashboard();
    window.addEventListener('assessment:saved', handler);
    return () => window.removeEventListener('assessment:saved', handler);
  }, []);

  useEffect(() => {
    const saved = location.state?.savedAssessment;
    if (!saved) return;
    setToast({ title: 'Assessment saved', msg: 'Your wellness profile has been updated.' });
    setTimeout(() => setToast(null), 3500);
    refreshDashboard();
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.savedAssessment]);

  const handleLogout = () => {
    auth.logout();
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
    if (!auth.isAuthenticated) {
        setToast({ title: "Error", msg: "You are not logged in!" });
        return;
    }

    setMood(selectedMood);

    const payload = {
        mood: selectedMood,
        score: getMoodScore(selectedMood),
        date: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_URL}/moods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Server Error");
      }

      if (res.ok) {
        setToast({ title: "Mood Logged", msg: "Added to your history" });
        setTimeout(() => setToast(null), 3000);
        refreshDashboard();
      } else {
        throw new Error(data.message || data.msg || "Failed to save mood");
      }
    } catch (err) {
      console.error("Mood Select Error:", err);
      setToast({ title: "Error", msg: err.message });
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
          <div className="border-teal-200 rounded-full">
            <img src="/Logo.jpg"
              alt="Nivana Logo"
              className="w-20 h-15 rounded-full shadow-md"
            />
          </div>
          <div>
            <div className="font-semibold text-lg">Nivana</div>
            <div className="text-xs text-black/50">Your Mind Speaks Nivana Listens</div>
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
        >Logout
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
            
            {/* MOOD GRAPH */}
            <div className="p-6 rounded-[2rem] bg-white/80 shadow-[var(--shadow-soft)] border border-black/10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Mood Flow</h3>
                  <p className="text-xs text-gray-500 font-medium">Your emotional journey this week</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                  Last 7 Days
                </div>
              </div>

              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyMoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} 
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4ade80', strokeWidth: 2, strokeDasharray: '5 5' }} />
                    <Area 
                      type="monotone" 
                      dataKey="moodScore" 
                      stroke="#22c55e" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorMood)" 
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#15803d' }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ✨ UPDATED FOCUS AREAS & BALANCE SECTION (List/Graph Toggle) */}
            <div className="p-6 rounded-[2rem] bg-white/80 shadow-[var(--shadow-soft)] border border-black/10 flex flex-col h-full relative overflow-hidden">
              
              {/* Header with Toggle */}
              <div className="flex justify-between items-start mb-6 z-10">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Wellness Balance</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {viewMode === 'list' ? "Detailed breakdown of your pillars" : "Visualizing your harmony"}
                  </p>
                </div>
                
                {/* View Toggle Button */}
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    List
                  </button>
                  <button 
                    onClick={() => setViewMode("radar")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'radar' ? 'bg-white shadow-sm text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Graph
                  </button>
                </div>
              </div>

              {/* CONTENT AREA */}
              <div className="flex-1 flex items-center justify-center">
                
                {/* OPTION A: RADAR CHART (Visual Balance) */}
                {viewMode === "radar" && (
                  <div className="w-full h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={improvementAreas}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis 
                          dataKey="area" 
                          tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Wellness"
                          dataKey="progress"
                          stroke="#22c55e"
                          strokeWidth={3}
                          fill="#4ade80"
                          fillOpacity={0.5}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          cursor={false}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                    {/* Central Score Indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <div className="text-xs font-bold text-green-700 bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm">
                        Avg: {Math.round(improvementAreas.reduce((a, b) => a + b.progress, 0) / 5)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION B: RICH LIST (Actionable Details) */}
                {viewMode === "list" && (
                  <div className="w-full space-y-4">
                    {improvementAreas.map((it, index) => {
                      const { icon, insight } = getAreaDetails(it.area, it.progress);
                      
                      return (
                        <motion.div 
                          key={it.area}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          {/* Labels Row */}
                          <div className="flex items-end justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg bg-gray-50 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100">
                                {icon}
                              </span>
                              <div>
                                <div className="text-sm font-bold text-gray-700 leading-none">{it.area}</div>
                                <div className="text-[10px] text-gray-400 font-medium mt-1 group-hover:text-green-600 transition-colors">
                                  {insight}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-bold ${it.progress < 50 ? 'text-red-500' : 'text-gray-700'}`}>
                                {it.progress}%
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden relative border border-gray-100">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-30 w-full h-full" 
                                style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.03) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.03) 50%,rgba(0,0,0,.03) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} 
                            />
                            
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${it.progress}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className={`h-full rounded-full relative overflow-hidden ${
                                it.progress < 40 ? "bg-gradient-to-r from-red-400 to-red-500" :
                                it.progress < 75 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" :
                                "bg-gradient-to-r from-green-400 to-green-500"
                              }`}
                            >
                              {/* Shimmer Effect */}
                              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
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