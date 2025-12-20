

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ButterFlyLayer from "./ButterFlyLayer"
import { Send, BookOpen, Heart, Calendar, Eye, Pencil, Trash2 } from "lucide-react"

export default function PrivateJournaling() {
  const [title, setTitle] = useState("")
  const [entry, setEntry] = useState("")
  const [pastEntries, setPastEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("journalEntries")) || []
    setPastEntries(saved)
  }, [])

  /* ---------------- SAVE / UPDATE ---------------- */
  const handleSave = () => {
    if (!entry.trim()) return

    if (isEditing && selectedEntry) {
      const updated = pastEntries.map((e) => (e.id === selectedEntry.id ? { ...e, title, text: entry } : e))
      setPastEntries(updated)
      localStorage.setItem("journalEntries", JSON.stringify(updated))
    } else {
      const newEntry = {
        id: Date.now(),
        title: title || "Untitled Letter",
        text: entry,
        date: new Date().toDateString(),
        mood: "🌿",
      }
      const updated = [newEntry, ...pastEntries]
      setPastEntries(updated)
      localStorage.setItem("journalEntries", JSON.stringify(updated))
    }

    resetEditor()
  }

  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) => {
    const updated = pastEntries.filter((e) => e.id !== id)
    setPastEntries(updated)
    localStorage.setItem("journalEntries", JSON.stringify(updated))
    if (selectedEntry?.id === id) resetEditor()
  }

  /* ---------------- HELPERS ---------------- */
  const resetEditor = () => {
    setTitle("")
    setEntry("")
    setSelectedEntry(null)
    setIsEditing(false)
  }

  const openForView = (e) => {
    setSelectedEntry(e)
    setTitle(e.title)
    setEntry(e.text)
    setIsEditing(false)
  }

  const openForEdit = (e) => {
    setSelectedEntry(e)
    setTitle(e.title)
    setEntry(e.text)
    setIsEditing(true)
  }

  /* ---------------- JOURNEY ---------------- */
  const totalEntries = pastEntries.length
  const streak = new Set(pastEntries.map((e) => new Date(e.date).toDateString())).size

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #87CEEB 0%, #A8D5E2 20%, #b8e6c9 40%, #c8f0d8 60%, #a8d5ba 80%, #8bc4a8 100%)",
        padding: "1rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ButterFlyLayer></ButterFlyLayer>
      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "100px",
          width: "120px",
          height: "120px",
          background: "radial-gradient(circle, #FFD700 0%, #FFA500 70%, transparent 100%)",
          borderRadius: "50%",
          boxShadow: "0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.3)",
          opacity: 0.85,
          zIndex: 1,
        }}
      />

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[...Array(4)].map((_, i) => (
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
              fontSize: "4rem",
              opacity: 0.6,
              filter: "blur(1px)",
            }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bird-${i}`}
            animate={{
              x: ["100vw", "-200px"],
              y: [0, Math.sin(i) * 50],
            }}
            transition={{
              duration: 25 + i * 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 5,
            }}
            style={{
              position: "absolute",
              top: `${100 + i * 60}px`,
              fontSize: "1.2rem",
              opacity: 0.7,
            }}
          >
            🕊️
          </motion.div>
        ))}
      </div>

      {/* Tree silhouettes background - updated positioning */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "300px",
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300'%3E%3Cg opacity='0.25' fill='%231a4d2e'%3E%3Cpath d='M100 300V200l-20-60-20 60v100z'/%3E%3Cpath d='M80 260l40-80-40-20-40 20z'/%3E%3Cpath d='M70 220l60-100-60-30-60 30z'/%3E%3Cpath d='M300 300V150l-25-80-25 80v150z'/%3E%3Cpath d='M275 230l50-100-50-25-50 25z'/%3E%3Cpath d='M265 180l70-120-70-35-70 35z'/%3E%3Cpath d='M600 300V220l-20-60-20 60v80z'/%3E%3Cpath d='M580 280l40-80-40-20-40 20z'/%3E%3Cpath d='M900 300V180l-30-90-30 90v120z'/%3E%3Cpath d='M870 250l60-120-60-30-60 30z'/%3E%3Cpath d='M860 190l80-140-80-40-80 40z'/%3E%3Cpath d='M1100 300V200l-25-70-25 70v100z'/%3E%3Cpath d='M1075 270l50-100-50-25-50 25z'/%3E%3C/g%3E%3C/svg%3E")
          `,
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "150px",
          background: "linear-gradient(to top, #2d5016 0%, #4a7c38 50%, transparent 100%)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[...Array(35)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ["0vh", "110vh"],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 1,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: "-50px",
              fontSize: "1.5rem",
              opacity: 0.4,
            }}
          >
            {["🍃", "🌿", "🍂", "🌾"][Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "3.5rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🌲</div>
          <h1
            style={{
              fontSize: "3rem",
              fontFamily: "Playfair Display",
              fontWeight: 700,
            
              color:"#379446",
              
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Private Journaling
          </h1>
          <p style={{ maxWidth: "520px", margin: "1rem auto", color: "#379446", fontSize: "1.05rem", opacity: 0.9 }}>
            A safe, gentle space to express your thoughts.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
          {/* ================= LETTER ================= */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "-25px",
                right: "40px",
                width: "70px",
                height: "70px",
                background: "radial-gradient(circle, #4a6b3a 0%, #3a5530 70%, #2a4020 100%)",
                borderRadius: "50%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(0,0,0,0.4)",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                transform: "rotate(-15deg)",
              }}
            >
              🌿
            </div>

            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                fontSize: "2.5rem",
                opacity: 0.25,
                transform: "rotate(-25deg)",
                zIndex: 5,
              }}
            >
              🌿
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                fontSize: "2.5rem",
                opacity: 0.25,
                transform: "rotate(35deg)",
                zIndex: 5,
              }}
            >
              🌾
            </div>

            <div
              style={{
                width: "100%",
                minHeight: "720px",
                background:
                  "linear-gradient(135deg, #f4e8c 0%, #e6d49a 15%, #d4b055 30%, #c79d38 45%, #b88c35 60%, #d4b055 75%, #e6d49a 90%, #f4e8c1 100%)",
                padding: "60px 70px",
                position: "relative",
                fontFamily: "Playfair Display, serif",
                boxShadow: "0 8px 20px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)",
                clipPath: `polygon(
                  2% 1%, 5% 0.5%, 8% 1.5%, 12% 0.8%, 15% 1.2%, 18% 0.5%, 22% 1%, 25% 0.8%, 
                  28% 1.5%, 32% 0.7%, 35% 1.3%, 38% 0.6%, 42% 1.1%, 45% 0.5%, 48% 1.2%, 
                  52% 0.8%, 55% 1.4%, 58% 0.6%, 62% 1%, 65% 0.7%, 68% 1.3%, 72% 0.9%, 
                  75% 1.2%, 78% 0.6%, 82% 1.1%, 85% 0.8%, 88% 1.4%, 92% 0.7%, 95% 1.2%, 98% 0.9%,
                  99% 3%, 99.5% 6%, 99.2% 9%, 99.8% 12%, 99.3% 15%, 99.7% 18%, 99.1% 22%, 
                  99.6% 25%, 99.2% 28%, 99.8% 32%, 99.4% 35%, 99.7% 38%, 99.3% 42%, 99.8% 45%, 
                  99.2% 48%, 99.6% 52%, 99.3% 55%, 99.7% 58%, 99.2% 62%, 99.8% 65%, 99.4% 68%, 
                  99.7% 72%, 99.3% 75%, 99.8% 78%, 99.2% 82%, 99.6% 85%, 99.3% 88%, 99.7% 92%, 99.2% 95%, 99.6% 98%,
                  98% 99%, 95% 99.5%, 92% 99.2%, 88% 99.7%, 85% 99.3%, 82% 99.8%, 78% 99.2%, 
                  75% 99.6%, 72% 99.1%, 68% 99.7%, 65% 99.3%, 62% 99.8%, 58% 99.2%, 55% 99.6%, 
                  52% 99.3%, 48% 99.7%, 45% 99.2%, 42% 99.8%, 38% 99.3%, 35% 99.7%, 32% 99.2%, 
                  28% 99.6%, 25% 99.3%, 22% 99.7%, 18% 99.2%, 15% 99.8%, 12% 99.4%, 8% 99.7%, 5% 99.3%, 2% 99.6%,
                  1% 98%, 0.5% 95%, 1.2% 92%, 0.7% 88%, 1.3% 85%, 0.6% 82%, 1.1% 78%, 0.8% 75%, 
                  1.4% 72%, 0.7% 68%, 1.2% 65%, 0.6% 62%, 1.1% 58%, 0.8% 55%, 1.3% 52%, 0.7% 48%, 
                  1.2% 45%, 0.6% 42%, 1.1% 48%, 0.8% 45%, 1.4% 42%, 0.7% 38%, 1.2% 35%, 0.6% 32%, 
                  1.1% 28%, 0.8% 25%, 1.3% 22%, 0.7% 18%, 1.2% 15%, 0.8% 12%, 1.3% 8%, 0.7% 5%, 1.2% 2%
                )`,
                // border: `px solid #552a28`,
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(90,110,60,0.03) 2px,
                    rgba(90,110,60,0.03) 4px
                  )
                `,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    radial-gradient(ellipse 120px 120px at top left, #a8864a, transparent 55%),
                    radial-gradient(ellipse 120px 120px at top right, #a8864a, transparent 55%),
                    radial-gradient(ellipse 120px 120px at bottom left, #a8864a, transparent 55%),
                    radial-gradient(ellipse 120px 120px at bottom right, #a8864a, transparent 55%)
                  `,
                  pointerEvents: "none",
                  opacity: 0.7,
                }}
              />

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#4a5a3e",
                  marginBottom: 30,
                  fontFamily: "Inter, system-ui",
                  fontSize: "0.9rem",
                  padding: "8px 16px",
                  background: "rgba(90,110,60,0.15)",
                  borderRadius: "6px",
                  border: "1px dashed rgba(74,90,62,0.3)",
                }}
              >
                <Calendar size={16} />
                {new Date().toDateString()}
              </div>

              <p style={{ fontStyle: "italic", fontSize: 24, marginBottom: 24, color: "#3a4929" }}>Dear Self 🌱</p>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Letter Title (optional)"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 26,
                  fontWeight: 600,
                  marginBottom: 20,
                  color: "#2a3a1d",
                  fontFamily: "Playfair Display, serif",
                  borderBottom: "2px solid rgba(74,90,62,0.3)",
                  paddingBottom: 12,
                }}
              />

              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Start writing your thoughts here..."
                style={{
                  width: "100%",
                  minHeight: "380px",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  background: "repeating-linear-gradient(transparent, transparent 33px, rgba(74,90,62,0.15) 34px)",
                  fontSize: 19,
                  lineHeight: "34px",
                  color: "#2a3a1d",
                  fontFamily: "Playfair Display, serif",
                }}
              />

              {/* FOOTER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: 30,
                  paddingTop: 20,
                  borderTop: "1px solid rgba(74,90,62,0.2)",
                }}
              >
                <p style={{ fontStyle: "italic", fontSize: 20, color: "#3a4929" }}>
                  With love and kindness,
                  <br />
                  <span style={{ fontSize: 22 }}>~ Me 🌿</span>
                </p>

                <button
                  onClick={handleSave}
                  style={{
                    background: "linear-gradient(135deg, #4a6b3a 0%, #6b9b5c 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: "999px",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(74,107,58,0.3), 0 2px 4px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(74,107,58,0.4), 0 4px 8px rgba(0,0,0,0.15)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,107,58,0.3), 0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  Save Entry <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* ================= SIDEBAR ================= */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
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
                <BookOpen size={20} />
                <b style={{ fontSize: "1.1rem" }}>Your Journey</b>
              </div>
              <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #2d5016 0%, #5a8c3a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {totalEntries}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#4a5a3e", marginTop: "4px" }}>Entries</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #2d5016 0%, #5a8c3a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {streak}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#4a5a3e", marginTop: "4px" }}>Day Streak</div>
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
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#4a5a3e" }}
              >
                <Heart size={20} />
                <b style={{ fontSize: "1.1rem" }}>Past Letters</b>
              </div>

              {pastEntries.length === 0 && (
                <p
                  style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.6, color: "#4a5a3e", fontStyle: "italic" }}
                >
                  No entries yet. Start writing 🌱
                </p>
              )}

              {pastEntries.map((e) => (
                <div
                  key={e.id}
                  style={{
                    marginTop: "1rem",
                    padding: "12px",
                    background: "rgba(90,110,60,0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(74,90,62,0.15)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(el) => {
                    el.currentTarget.style.background = "rgba(90,110,60,0.12)"
                    el.currentTarget.style.transform = "translateX(4px)"
                  }}
                  onMouseLeave={(el) => {
                    el.currentTarget.style.background = "rgba(90,110,60,0.08)"
                    el.currentTarget.style.transform = "translateX(0)"
                  }}
                >
                  <div style={{ fontSize: "1.3rem", marginBottom: "4px" }}>{e.mood}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3a4929", marginBottom: "4px" }}>
                    {e.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#4a5a3e", lineHeight: "1.4" }}>
                    {e.text.slice(0, 60)}
                    {e.text.length > 60 && "..."}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#5a7055", marginTop: "6px", opacity: 0.7 }}>{e.date}</div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "10px",
                      paddingTop: "8px",
                      borderTop: "1px solid rgba(74,90,62,0.15)",
                    }}
                  >
                    <button
                      onClick={() => openForView(e)}
                      style={{
                        background: "linear-gradient(135deg, #5a8c3a 0%, #6b9b5c 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(el) => {
                        el.currentTarget.style.transform = "translateY(-1px)"
                        el.currentTarget.style.boxShadow = "0 4px 8px rgba(74,107,58,0.3)"
                      }}
                      onMouseLeave={(el) => {
                        el.currentTarget.style.transform = "translateY(0)"
                        el.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      <Eye size={14} />
                      View
                    </button>

                    <button
                      onClick={() => openForEdit(e)}
                      style={{
                        background: "linear-gradient(135deg, #4a6b3a 0%, #5a7c4a 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(el) => {
                        el.currentTarget.style.transform = "translateY(-1px)"
                        el.currentTarget.style.boxShadow = "0 4px 8px rgba(74,107,58,0.3)"
                      }}
                      onMouseLeave={(el) => {
                        el.currentTarget.style.transform = "translateY(0)"
                        el.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(e.id)}
                      style={{
                        background: "linear-gradient(135deg, #8b4444 0%, #a85555 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(el) => {
                        el.currentTarget.style.transform = "translateY(-1px)"
                        el.currentTarget.style.boxShadow = "0 4px 8px rgba(139,68,68,0.3)"
                      }}
                      onMouseLeave={(el) => {
                        el.currentTarget.style.transform = "translateY(0)"
                        el.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
