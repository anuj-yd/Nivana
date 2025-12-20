"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  AlertCircle,
  Wind,
  Phone,
  BookOpen,
  Heart,
} from "lucide-react"

export default function GuidedMeditation() {
  const [selectedMeditation, setSelectedMeditation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [customDuration, setCustomDuration] = useState(5)
  const [meditationComplete, setMeditationComplete] = useState(false)
  const [postMeditationFeeling, setPostMeditationFeeling] = useState(null)
  const [breathPhase, setBreathPhase] = useState("inhale")
  const [breathCount, setBreathCount] = useState(0)
  const [isBreathing, setIsBreathing] = useState(false)
  const [meditationStreak, setMeditationStreak] = useState(0)
  const [showEmergencyNotification, setShowEmergencyNotification] = useState(false)
  const [emergencyContact, setEmergencyContact] = useState("")

  const audioRef = useRef(null)
  const intervalRef = useRef(null)
  const breathIntervalRef = useRef(null)

  useEffect(() => {
    const savedCompletions = JSON.parse(localStorage.getItem("meditationCompletions")) || 0
    const savedStreak = JSON.parse(localStorage.getItem("meditationStreak")) || 0
    const lastMeditationDate = localStorage.getItem("lastMeditationDate")
    const savedEmergencyContact = localStorage.getItem("emergencyContact") || ""

    setCompletedSessions(savedCompletions)
    setEmergencyContact(savedEmergencyContact)

    if (lastMeditationDate) {
      const today = new Date().toDateString()
      const lastDate = new Date(lastMeditationDate).toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()

      if (today === lastDate || yesterday === lastDate) {
        setMeditationStreak(savedStreak)
      } else {
        setMeditationStreak(0)
        localStorage.setItem("meditationStreak", JSON.JSON.stringify(0))
      }
    } else {
      setMeditationStreak(savedStreak)
    }
  }, [])

  useEffect(() => {
    if (isBreathing) {
      const interval = setInterval(() => {
        setBreathPhase((prev) => {
          if (prev === "inhale") return "hold"
          if (prev === "hold") return "exhale"
          if (prev === "exhale") {
            setBreathCount((c) => c + 1)
            return "inhale"
          }
          return "inhale"
        })
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [isBreathing])

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartCustomMeditation = () => {
    const customMeditation = {
      id: "custom",
      title: "Custom Session",
      duration: customDuration * 60,
      description: "Your personalized meditation practice",
      audioUrl: "/audio/ambient-loop.mp3",
      isCustom: true,
    }
    setSelectedMeditation(customMeditation)
    setCurrentTime(0)
    setIsPlaying(false)
    setMeditationComplete(false)
    setPostMeditationFeeling(null)
  }

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (audioRef.current) audioRef.current.pause()
    } else {
      setIsPlaying(true)

      if (audioRef.current) {
        audioRef.current.loop = true
        audioRef.current.play().catch((err) => console.log("Audio play error:", err))
      }

      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= selectedMeditation.duration) {
            clearInterval(intervalRef.current)
            setIsPlaying(false)
            if (audioRef.current) audioRef.current.pause()
            handleMeditationComplete()
            return selectedMeditation.duration
          }
          return prev + 1
        })
      }, 1000)
    }
  }

  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handleMeditationComplete = () => {
    setMeditationComplete(true)
    const newCount = completedSessions + 1
    setCompletedSessions(newCount)
    localStorage.setItem("meditationCompletions", JSON.stringify(newCount))

    // Update streak
    const today = new Date().toDateString()
    const lastMeditationDate = localStorage.getItem("lastMeditationDate")

    if (lastMeditationDate !== today) {
      const newStreak = meditationStreak + 1
      setMeditationStreak(newStreak)
      localStorage.setItem("meditationStreak", JSON.stringify(newStreak))
      localStorage.setItem("lastMeditationDate", today)
    }
  }

  const handlePostMeditationFeeling = async (feeling) => {
    setPostMeditationFeeling(feeling)

    // Save to localStorage for dashboard integration
    const meditationHistory = JSON.parse(localStorage.getItem("meditationHistory")) || []
    const newEntry = {
      date: new Date().toISOString(),
      duration: selectedMeditation.duration,
      title: selectedMeditation.title,
      postFeeling: feeling,
      timestamp: Date.now(),
    }
    meditationHistory.push(newEntry)
    localStorage.setItem("meditationHistory", JSON.stringify(meditationHistory))

    // Map feeling to mood score for dashboard integration
    const moodMapping = {
      calmer: { mood: "good", score: 8 },
      same: { mood: "okay", score: 6 },
      restless: { mood: "low", score: 4 },
    }

    const moodData = moodMapping[feeling]

    // Update mood graph data
    const moodEntries = JSON.parse(localStorage.getItem("moodEntries")) || []
    moodEntries.push({
      mood: moodData.mood,
      score: moodData.score,
      date: new Date().toISOString(),
      source: "meditation",
    })
    localStorage.setItem("moodEntries", JSON.stringify(moodEntries))

    // Show completion message
    setTimeout(() => {
      setSelectedMeditation(null)
      setMeditationComplete(false)
      setPostMeditationFeeling(null)
    }, 2000)
  }

  const handleEmergencyCalm = () => {
    const emergencyMeditation = {
      id: "emergency",
      title: "Quick Calm",
      duration: 60,
      description: "60-second grounding for overwhelming moments",
      audioUrl: "/audio/emergency-calm.mp3",
    }
    setSelectedMeditation(emergencyMeditation)
    setCurrentTime(0)
    setMeditationComplete(false)
    setShowEmergencyNotification(true)

    // Send notification to emergency contact
    if (emergencyContact) {
      sendEmergencyNotification()
    }
  }

  const sendEmergencyNotification = async () => {
    try {
      const message = `Emergency Alert: Your close one needs support. They are feeling overwhelmed and using the Quick Calm feature.`

      // You can integrate with Twilio, SendGrid, or any notification service
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/emergency-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: emergencyContact,
          message: message,
          timestamp: new Date().toISOString(),
        }),
      })

      console.log("Emergency notification sent to:", emergencyContact)
    } catch (err) {
      console.log("Failed to send emergency notification:", err)
    }

    setTimeout(() => setShowEmergencyNotification(false), 3000)
  }

  const handleSaveEmergencyContact = () => {
    localStorage.setItem("emergencyContact", emergencyContact)
    alert("Emergency contact saved!")
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  // Calculate progress percentage
  const progress = selectedMeditation ? (currentTime / selectedMeditation.duration) * 100 : 0

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #87CEEB 0%, #A8D5E2 20%, #b8e6c9 40%, #c8f0d8 60%, #8bc4a8 100%)",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "80px",
          width: "100px",
          height: "100px",
          background: "radial-gradient(circle, #FFD700 0%, #FFA500 70%, transparent 100%)",
          borderRadius: "50%",
          boxShadow: "0 0 40px rgba(255, 215, 0, 0.6)",
          opacity: 0.85,
          zIndex: 1,
        }}
      />

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            animate={{
              x: ["-200px", "calc(100vw + 200px)"],
            }}
            transition={{
              duration: 40 + i * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 8,
            }}
            style={{
              position: "absolute",
              top: `${50 + i * 80}px`,
              fontSize: "3rem",
              opacity: 0.5,
              filter: "blur(1px)",
            }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={handleEmergencyCalm}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 50,
          padding: "1rem",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8b4444 0%, #a85555 100%)",
          color: "#fff",
          border: "none",
          boxShadow: "0 8px 24px rgba(139, 68, 68, 0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="I feel overwhelmed"
      >
        <AlertCircle size={28} />
      </motion.button>

      <AnimatePresence>
        {showEmergencyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 50,
              padding: "1rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(74, 107, 58, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "320px",
            }}
          >
            <Phone size={24} />
            <div>
              <div style={{ fontWeight: 600 }}>Emergency contact notified</div>
              <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Help is on the way</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="nature-blob -top-32 -right-32 w-96 h-96 bg-purple-300/20"></div>
        <div className="nature-blob top-1/4 -left-20 w-80 h-80 bg-blue-300/15"></div>
        <div className="nature-blob bottom-1/3 right-1/4 w-72 h-72 bg-green-200/15"></div>
      </div>

      {/* Audio element for looping */}
      <audio ref={audioRef} src={selectedMeditation?.audioUrl} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "3rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🧘‍♀️</div>
          <h1
            style={{
              fontSize: "2.75rem",
              fontFamily: "Playfair Display",
              fontWeight: 700,
              color: "#379446",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              marginBottom: "0.5rem",
            }}
          >
            Guided Meditation
          </h1>
          <p style={{ maxWidth: "520px", margin: "0 auto", color: "#379446", fontSize: "1.05rem", opacity: 0.9 }}>
            A peaceful space to calm your mind and find inner peace.
          </p>
        </div>

        {!selectedMeditation ? (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
            <div>
              {/* Custom Timer Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
                  borderRadius: "16px",
                  padding: "2rem",
                  marginBottom: "1.5rem",
                  border: "1px solid rgba(74,90,62,0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "30px",
                    width: "60px",
                    height: "60px",
                    background: "radial-gradient(circle, #4a6b3a 0%, #3a5530 70%, #2a4020 100%)",
                    borderRadius: "50%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    transform: "rotate(-15deg)",
                  }}
                >
                  ⏱️
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#4a5a3e" }}
                >
                  <BookOpen size={20} />
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Set Your Time</h3>
                </div>
                <p style={{ fontSize: "0.95rem", color: "#4a5a3e", marginBottom: "1.5rem", opacity: 0.85 }}>
                  Choose how long you want to meditate today
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
                  <button
                    onClick={() => setCustomDuration(Math.max(1, customDuration - 1))}
                    style={{
                      padding: "12px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 8px rgba(74, 107, 58, 0.3)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Minus size={20} />
                  </button>

                  <div
                    style={{
                      padding: "1.5rem 2.5rem",
                      borderRadius: "16px",
                      background: "rgba(90,110,60,0.12)",
                      border: "2px solid rgba(74,90,62,0.25)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "3rem",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #2d5016 0%, #5a8c3a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: 1,
                      }}
                    >
                      {customDuration}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#4a5a3e", textAlign: "center", marginTop: "4px" }}>
                      minutes
                    </div>
                  </div>

                  <button
                    onClick={() => setCustomDuration(Math.min(60, customDuration + 1))}
                    style={{
                      padding: "12px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 8px rgba(74, 107, 58, 0.3)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={handleStartCustomMeditation}
                  style={{
                    width: "100%",
                    marginTop: "1.5rem",
                    padding: "1rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)",
                    color: "#fff",
                    border: "none",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(74, 107, 58, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Start Meditation
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                  borderRadius: "16px",
                  padding: "2rem",
                  marginBottom: "1.5rem",
                  border: "1px solid rgba(74,107,58,0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    fontSize: "2rem",
                  }}
                >
                  🍃
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#2d5016", marginBottom: "0.5rem" }}>
                    Breathing Exercise
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: "#4a6b3a", opacity: 0.9 }}>
                    Follow the 4-4-4 breathing pattern for relaxation
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                  <motion.div
                    animate={{
                      scale: breathPhase === "inhale" ? 1.3 : breathPhase === "hold" ? 1.3 : 1,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #81c784 0%, #66bb6a 100%)",
                      boxShadow: "0 8px 24px rgba(102, 187, 106, 0.4)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Wind size={40} color="#fff" strokeWidth={2.5} />
                    <motion.div
                      key={breathPhase}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#fff",
                        textTransform: "capitalize",
                      }}
                    >
                      {breathPhase}
                    </motion.div>
                  </motion.div>

                  <div style={{ textAlign: "center", width: "100%" }}>
                    <button
                      onClick={() => {
                        setIsBreathing(!isBreathing)
                        if (!isBreathing) {
                          setBreathCount(0)
                          setBreathPhase("inhale")
                        }
                      }}
                      style={{
                        width: "100%",
                        maxWidth: "280px",
                        padding: "1rem 2rem",
                        borderRadius: "12px",
                        background: isBreathing
                          ? "linear-gradient(135deg, #757575 0%, #616161 100%)"
                          : "linear-gradient(135deg, #4a6b3a 0%, #5a7b4a 100%)",
                        color: "#fff",
                        border: "none",
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(74, 107, 58, 0.3)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isBreathing ? "Stop Breathing" : "Start Breathing"}
                    </button>
                    {breathCount > 0 && (
                      <div
                        style={{
                          marginTop: "1rem",
                          fontSize: "0.9rem",
                          color: "#4a6b3a",
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "#2d5016", fontSize: "1.1rem" }}>{breathCount}</span>{" "}
                        cycles completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: "linear-gradient(135deg, #fff0e6 0%, #ffe6d6 100%)",
                  borderRadius: "16px",
                  padding: "2rem",
                  border: "1px solid rgba(139,68,68,0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "30px",
                    width: "60px",
                    height: "60px",
                    background: "radial-gradient(circle, #8b4444 0%, #7b3434 70%, #6b2424 100%)",
                    borderRadius: "50%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  <Phone size={24} color="#fff" />
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#7b3434" }}
                >
                  <AlertCircle size={20} />
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Emergency Contact</h3>
                </div>
                <p style={{ fontSize: "0.95rem", color: "#7b3434", marginBottom: "1.5rem", opacity: 0.85 }}>
                  Set a trusted contact to be notified when you need support
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Phone number or email"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(139,68,68,0.3)",
                      outline: "none",
                      fontSize: "0.95rem",
                      background: "rgba(255,255,255,0.8)",
                    }}
                  />
                  <button
                    onClick={handleSaveEmergencyContact}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #8b4444 0%, #a85555 100%)",
                      color: "#fff",
                      border: "none",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 8px rgba(139, 68, 68, 0.3)",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                  border: "1px solid rgba(74,90,62,0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#4a5a3e" }}
                >
                  <Heart size={20} />
                  <b style={{ fontSize: "1.1rem" }}>Your Journey</b>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      background: "rgba(90,110,60,0.08)",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #2d5016 0%, #5a8c3a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {completedSessions}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#4a5a3e", marginTop: "4px" }}>Sessions</div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      background: "rgba(90,110,60,0.08)",
                      borderRadius: "12px",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "4px" }}>🔥</div>
                    <div
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {meditationStreak}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#4a5a3e", marginTop: "4px" }}>Day Streak</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid rgba(74,90,62,0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#4a5a3e" }}
                >
                  <BookOpen size={20} />
                  <b style={{ fontSize: "1.1rem" }}>Benefits</b>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#4a5a3e", lineHeight: "1.6" }}>
                  <div style={{ marginBottom: "0.75rem" }}>🌱 Reduces stress and anxiety</div>
                  <div style={{ marginBottom: "0.75rem" }}>🧠 Improves focus and clarity</div>
                  <div style={{ marginBottom: "0.75rem" }}>💚 Enhances emotional wellbeing</div>
                  <div>✨ Promotes better sleep</div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Meditation Player View
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
              borderRadius: "24px",
              padding: "3rem",
              maxWidth: "600px",
              margin: "0 auto",
              border: "2px solid rgba(74,90,62,0.2)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            {!meditationComplete ? (
              <>
                <button
                  onClick={() => {
                    setSelectedMeditation(null)
                    handleReset()
                  }}
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    left: "1.5rem",
                    padding: "8px",
                    borderRadius: "8px",
                    background: "rgba(90,110,60,0.12)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#4a5a3e",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  ← Back
                </button>

                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🧘‍♀️</div>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#2d5016",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {selectedMeditation.title}
                  </h2>
                  <p style={{ color: "#4a5a3e", fontSize: "1rem" }}>{selectedMeditation.description}</p>
                </div>

                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    margin: "0 auto 2rem",
                    borderRadius: "50%",
                    background: `conic-gradient(#5a8c3a ${progress}%, rgba(90,110,60,0.12) ${progress}%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "170px",
                      height: "170px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "#2d5016",
                      }}
                    >
                      {formatTime(currentTime)}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#4a5a3e", marginTop: "4px" }}>
                      {formatTime(selectedMeditation.duration - currentTime)} left
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                  <button
                    onClick={togglePlayPause}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 20px rgba(74, 107, 58, 0.4)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                  </button>

                  <button
                    onClick={handleReset}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(90,110,60,0.12)",
                      color: "#4a5a3e",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <RotateCcw size={24} />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(90,110,60,0.12)",
                      color: "#4a5a3e",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✨</div>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#2d5016",
                    marginBottom: "1.5rem",
                  }}
                >
                  How do you feel now?
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <button
                    onClick={() => handlePostMeditationFeeling("calmer")}
                    style={{
                      width: "100%",
                      padding: "1.25rem",
                      borderRadius: "12px",
                      background:
                        postMeditationFeeling === "calmer"
                          ? "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)"
                          : "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
                      color: postMeditationFeeling === "calmer" ? "#fff" : "#4a5a3e",
                      border: "2px solid rgba(74,90,62,0.25)",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>😌</span>
                    Calmer
                  </button>

                  <button
                    onClick={() => handlePostMeditationFeeling("same")}
                    style={{
                      width: "100%",
                      padding: "1.25rem",
                      borderRadius: "12px",
                      background:
                        postMeditationFeeling === "same"
                          ? "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)"
                          : "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
                      color: postMeditationFeeling === "same" ? "#fff" : "#4a5a3e",
                      border: "2px solid rgba(74,90,62,0.25)",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>🙂</span>
                    Same
                  </button>

                  <button
                    onClick={() => handlePostMeditationFeeling("restless")}
                    style={{
                      width: "100%",
                      padding: "1.25rem",
                      borderRadius: "12px",
                      background:
                        postMeditationFeeling === "restless"
                          ? "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)"
                          : "linear-gradient(135deg, #f0f8ec 0%, #e6f2e0 100%)",
                      color: postMeditationFeeling === "restless" ? "#fff" : "#4a5a3e",
                      border: "2px solid rgba(74,90,62,0.25)",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>😕</span>
                    Still Restless
                  </button>
                </div>

                {postMeditationFeeling && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: "1.5rem",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "rgba(90,110,60,0.12)",
                      color: "#2d5016",
                      fontWeight: 600,
                    }}
                  >
                    Response saved! 🌱
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .nature-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, 30px) scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
