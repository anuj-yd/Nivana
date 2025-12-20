// // "use client"

// // import { useState, useRef, useEffect } from "react"
// // import { motion } from "framer-motion"
// // import { Volume2, VolumeX, Play, Pause } from "lucide-react"

// // const AMBIENT_SOUNDS = [
// //   { id: "rain", name: "Rain", icon: "🌧️", audioUrl: "/sounds/rain.mp3", color: "#5b8db8" },
// //   { id: "forest", name: "Forest", icon: "🌲", audioUrl: "/sounds/forest.mp3", color: "#4a7c59" },
// //   { id: "ocean", name: "Ocean Waves", icon: "🌊", audioUrl: "/sounds/ocean.mp3", color: "#4682b4" },
// //   { id: "fireplace", name: "Fireplace", icon: "🔥", audioUrl: "/sounds/fireplace.mp3", color: "#d97706" },
// //   { id: "birds", name: "Birds", icon: "🐦", audioUrl: "/sounds/birds.mp3", color: "#8b9467" },
// //   { id: "thunder", name: "Thunder", icon: "⚡", audioUrl: "/sounds/thunder.mp3", color: "#6b7280" },
// //   { id: "wind", name: "Wind", icon: "🍃", audioUrl: "/sounds/wind.mp3", color: "#7ba896" },
// //   { id: "night", name: "Night Crickets", icon: "🌙", audioUrl: "/sounds/crickets.mp3", color: "#4a5568" },
// // ]

// // export default function AmbientSoundscape() {
// //   const [activeSounds, setActiveSounds] = useState(new Set())
// //   const [volumes, setVolumes] = useState({})
// //   const audioRefs = useRef({})

// //   useEffect(() => {
// //     AMBIENT_SOUNDS.forEach((sound) => {
// //       const audio = new Audio(sound.audioUrl)
// //       audio.loop = true
// //       audio.volume = 0.5
// //       audioRefs.current[sound.id] = audio
// //     })

// //     return () => {
// //       Object.values(audioRefs.current).forEach((audio) => {
// //         audio.pause()
// //         audio.src = ""
// //       })
// //     }
// //   }, [])

// //   const toggleSound = (soundId) => {
// //     const audio = audioRefs.current[soundId]
// //     if (!audio) return

// //     if (activeSounds.has(soundId)) {
// //       audio.pause()
// //       setActiveSounds((prev) => {
// //         const newSet = new Set(prev)
// //         newSet.delete(soundId)
// //         return newSet
// //       })
// //     } else {
// //       audio.play().catch((err) => console.log("Audio play error:", err))
// //       setActiveSounds((prev) => new Set(prev).add(soundId))
// //     }
// //   }

// //   const adjustVolume = (soundId, volume) => {
// //     const audio = audioRefs.current[soundId]
// //     if (audio) {
// //       audio.volume = volume
// //       setVolumes((prev) => ({ ...prev, [soundId]: volume }))
// //     }
// //   }

// //   const stopAll = () => {
// //     Object.values(audioRefs.current).forEach((audio) => audio.pause())
// //     setActiveSounds(new Set())
// //   }

// //   return (
// //     <div
// //       style={{
// //         minHeight: "100vh",
// //         background: "linear-gradient(to bottom, #87ceeb 0%, #98d8c8 50%, #b8e6b8 100%)",
// //         padding: "3rem 1.5rem",
// //         position: "relative",
// //         overflow: "hidden",
// //       }}
// //     >
// //       {/* Clouds */}
// //       <div className="cloud" style={{ top: "10%", left: "-10%", animationDuration: "45s" }} />
// //       <div className="cloud" style={{ top: "25%", right: "-10%", animationDuration: "55s" }} />
// //       <div className="cloud" style={{ top: "60%", left: "-10%", animationDuration: "50s" }} />

// //       <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
// //         <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
// //           <div style={{ fontSize: "3rem" }}>🎵</div>
// //           <h1 style={{ fontSize: "2.7rem", fontWeight: 700, color: "#379446" }}>
// //             Ambient Soundscape
// //           </h1>
// //           <p style={{ color: "#379446" }}>
// //             Create your perfect atmosphere by mixing calming nature sounds
// //           </p>
// //         </div>

// //         {activeSounds.size > 0 && (
// //           <div style={{ textAlign: "center", marginBottom: "2rem" }}>
// //             <button
// //               onClick={stopAll}
// //               style={{
// //                 padding: "12px 32px",
// //                 borderRadius: "12px",
// //                 background: "#ef4444",
// //                 color: "#fff",
// //                 border: "none",
// //                 fontWeight: 600,
// //                 cursor: "pointer",
// //               }}
// //             >
// //               Stop All Sounds
// //             </button>
// //           </div>
// //         )}

// //         <div
// //           style={{
// //             display: "grid",
// //             gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
// //             gap: "1.5rem",
// //           }}
// //         >
// //           {AMBIENT_SOUNDS.map((sound, index) => {
// //             const isActive = activeSounds.has(sound.id)
// //             const volume = volumes[sound.id] ?? 0.5

// //             return (
// //               <motion.div
// //                 key={sound.id}
// //                 initial={{ opacity: 0, y: 20 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: index * 0.05 }}
// //                 style={{
// //                   background: "#f0f8ec",
// //                   borderRadius: "16px",
// //                   padding: "1.5rem",
// //                   border: `2px solid ${isActive ? sound.color : "#ccc"}`,
// //                 }}
// //               >
// //                 <h3 style={{ color: isActive ? sound.color : "#4a5a3e" }}>
// //                   {sound.icon} {sound.name}
// //                 </h3>

// //                 <button
// //                   onClick={() => toggleSound(sound.id)}
// //                   style={{
// //                     width: "100%",
// //                     padding: "12px",
// //                     borderRadius: "10px",
// //                     background: isActive ? sound.color : "#9ca3af",
// //                     color: "#fff",
// //                     border: "none",
// //                     marginBottom: "1rem",
// //                     cursor: "pointer",
// //                   }}
// //                 >
// //                   {isActive ? <Pause size={18} /> : <Play size={18} />}
// //                   {isActive ? " Playing" : " Play"}
// //                 </button>

// //                 {isActive && (
// //                   <>
// //                     <div style={{ display: "flex", justifyContent: "space-between" }}>
// //                       <span>
// //                         {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />} Volume
// //                       </span>
// //                       <span>{Math.round(volume * 100)}%</span>
// //                     </div>

// //                     <input
// //                       type="range"
// //                       min="0"
// //                       max="1"
// //                       step="0.01"
// //                       value={volume}
// //                       onChange={(e) =>
// //                         adjustVolume(sound.id, Number(e.target.value))
// //                       }
// //                       style={{ width: "100%" }}
// //                     />
// //                   </>
// //                 )}
// //               </motion.div>
// //             )
// //           })}
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }




// "use client"

// import { useState, useRef, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Volume2, VolumeX, Play, Pause } from "lucide-react"

// const AMBIENT_SOUNDS = [
//   { id: "rain", name: "Rain", icon: "🌧️", audioUrl: "/sounds/rain.mp3", color: "#5b8db8" },
//   { id: "forest", name: "Forest", icon: "🌲", audioUrl: "/sounds/forest.mp3", color: "#4a7c59" },
//   { id: "ocean", name: "Ocean Waves", icon: "🌊", audioUrl: "/sounds/ocean.mp3", color: "#4682b4" },
//   { id: "fireplace", name: "Fireplace", icon: "🔥", audioUrl: "/sounds/fireplace.mp3", color: "#d97706" },
//   { id: "birds", name: "Birds", icon: "🐦", audioUrl: "/sounds/birds.mp3", color: "#8b9467" },
//   { id: "thunder", name: "Thunder", icon: "⚡", audioUrl: "/sounds/thunder.mp3", color: "#6b7280" },
//   { id: "wind", name: "Wind", icon: "🍃", audioUrl: "/sounds/wind.mp3", color: "#7ba896" },
//   { id: "night", name: "Night Crickets", icon: "🌙", audioUrl: "/sounds/crickets.mp3", color: "#4a5568" },
// ]

// export default function AmbientSoundscape() {
//   const [activeSounds, setActiveSounds] = useState(new Set())
//   const [volumes, setVolumes] = useState({})
//   const [lastPlayedSound, setLastPlayedSound] = useState(null)
//   const audioRefs = useRef({})

//   useEffect(() => {
//     AMBIENT_SOUNDS.forEach((sound) => {
//       const audio = new Audio(sound.audioUrl)
//       audio.loop = true
//       audio.volume = 0.5
//       audioRefs.current[sound.id] = audio
//     })

//     return () => {
//       Object.values(audioRefs.current).forEach((audio) => {
//         audio.pause()
//         audio.src = ""
//       })
//     }
//   }, [])

//   const toggleSound = (soundId) => {
//     const audio = audioRefs.current[soundId]
//     if (!audio) return

//     if (activeSounds.has(soundId)) {
//       audio.pause()
//       setActiveSounds((prev) => {
//         const newSet = new Set(prev)
//         newSet.delete(soundId)
//         return newSet
//       })
//       if (lastPlayedSound === soundId) {
//         const remaining = Array.from(activeSounds).filter((id) => id !== soundId)
//         setLastPlayedSound(remaining.length > 0 ? remaining[remaining.length - 1] : null)
//       }
//     } else {
//       audio.play().catch((err) => console.log("Audio play error:", err))
//       setActiveSounds((prev) => new Set(prev).add(soundId))
//       setLastPlayedSound(soundId)
//     }
//   }

//   const adjustVolume = (soundId, volume) => {
//     const audio = audioRefs.current[soundId]
//     if (audio) {
//       audio.volume = volume
//       setVolumes((prev) => ({ ...prev, [soundId]: volume }))
//     }
//   }

//   const stopAll = () => {
//     Object.values(audioRefs.current).forEach((audio) => audio.pause())
//     setActiveSounds(new Set())
//     setLastPlayedSound(null)
//   }

//   const getBackgroundGradient = () => {
//     if (!lastPlayedSound) {
//       return "linear-gradient(to bottom, #87ceeb 0%, #98d8c8 50%, #b8e6b8 100%)"
//     }

//     const sound = AMBIENT_SOUNDS.find((s) => s.id === lastPlayedSound)
//     if (!sound) return "linear-gradient(to bottom, #87ceeb 0%, #98d8c8 50%, #b8e6b8 100%)"

//     // Create gradient with the sound's color
//     const baseColor = sound.color
//     return `linear-gradient(135deg, ${baseColor}15 0%, ${baseColor}40 50%, ${baseColor}25 100%)`
//   }

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: getBackgroundGradient(),
//         padding: "3rem 1.5rem",
//         position: "relative",
//         overflow: "hidden",
//         transition: "background 0.8s ease-in-out",
//       }}
//     >
//       {/* Clouds */}
//       <div className="cloud" style={{ top: "10%", left: "-10%", animationDuration: "45s" }} />
//       <div className="cloud" style={{ top: "25%", right: "-10%", animationDuration: "55s" }} />
//       <div className="cloud" style={{ top: "60%", left: "-10%", animationDuration: "50s" }} />

//       <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
//         <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
//           <div style={{ fontSize: "3rem" }}>🎵</div>
//           <h1 style={{ fontSize: "2.7rem", fontWeight: 700, color: "#379446" }}>Ambient Soundscape</h1>
//           <p style={{ color: "#379446" }}>Create your perfect atmosphere by mixing calming nature sounds</p>
//           {lastPlayedSound && (
//             <motion.p
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               style={{
//                 color: AMBIENT_SOUNDS.find((s) => s.id === lastPlayedSound)?.color,
//                 fontWeight: 600,
//                 marginTop: "0.5rem",
//               }}
//             >
//               Current Theme: {AMBIENT_SOUNDS.find((s) => s.id === lastPlayedSound)?.icon}{" "}
//               {AMBIENT_SOUNDS.find((s) => s.id === lastPlayedSound)?.name}
//             </motion.p>
//           )}
//         </div>

//         {activeSounds.size > 0 && (
//           <div style={{ textAlign: "center", marginBottom: "2rem" }}>
//             <button
//               onClick={stopAll}
//               style={{
//                 padding: "12px 32px",
//                 borderRadius: "12px",
//                 background: "#ef4444",
//                 color: "#fff",
//                 border: "none",
//                 fontWeight: 600,
//                 cursor: "pointer",
//               }}
//             >
//               Stop All Sounds
//             </button>
//           </div>
//         )}

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//             gap: "1.5rem",
//           }}
//         >
//           {AMBIENT_SOUNDS.map((sound, index) => {
//             const isActive = activeSounds.has(sound.id)
//             const volume = volumes[sound.id] ?? 0.5

//             return (
//               <motion.div
//                 key={sound.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 style={{
//                   background: "#f0f8ec",
//                   borderRadius: "16px",
//                   padding: "1.5rem",
//                   border: `2px solid ${isActive ? sound.color : "#ccc"}`,
//                 }}
//               >
//                 <h3 style={{ color: isActive ? sound.color : "#4a5a3e" }}>
//                   {sound.icon} {sound.name}
//                 </h3>

//                 <button
//                   onClick={() => toggleSound(sound.id)}
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     borderRadius: "10px",
//                     background: isActive ? sound.color : "#9ca3af",
//                     color: "#fff",
//                     border: "none",
//                     marginBottom: "1rem",
//                     cursor: "pointer",
//                   }}
//                 >
//                   {isActive ? <Pause size={18} /> : <Play size={18} />}
//                   {isActive ? " Playing" : " Play"}
//                 </button>

//                 {isActive && (
//                   <>
//                     <div style={{ display: "flex", justifyContent: "space-between" }}>
//                       <span>{volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />} Volume</span>
//                       <span>{Math.round(volume * 100)}%</span>
//                     </div>

//                     <input
//                       type="range"
//                       min="0"
//                       max="1"
//                       step="0.01"
//                       value={volume}
//                       onChange={(e) => adjustVolume(sound.id, Number(e.target.value))}
//                       style={{ width: "100%" }}
//                     />
//                   </>
//                 )}
//               </motion.div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"

const AMBIENT_SOUNDS = [
  { id: "rain", name: "Rain", icon: "🌧️", audioUrl: "/sounds/rain.mp3", color: "#5b8db8" },
  { id: "forest", name: "Forest", icon: "🌲", audioUrl: "/sounds/forest.mp3", color: "#4a7c59" },
  { id: "ocean", name: "Ocean Waves", icon: "🌊", audioUrl: "/sounds/ocean.mp3", color: "#4682b4" },
  { id: "fireplace", name: "Fireplace", icon: "🔥", audioUrl: "/sounds/fireplace.mp3", color: "#d97706" },
  { id: "birds", name: "Birds", icon: "🐦", audioUrl: "/sounds/birds.mp3", color: "#8b9467" },
  { id: "thunder", name: "Thunder", icon: "⚡", audioUrl: "/sounds/thunder.mp3", color: "#6b7280" },
  { id: "wind", name: "Wind", icon: "🍃", audioUrl: "/sounds/wind.mp3", color: "#7ba896" },
  { id: "night", name: "Night Crickets", icon: "🌙", audioUrl: "/sounds/crickets.mp3", color: "#4a5568" },
]

export default function AmbientSoundscape() {
  const [activeSounds, setActiveSounds] = useState(new Set())
  const [volumes, setVolumes] = useState({})
  const [lastPlayedSound, setLastPlayedSound] = useState(null)
  const audioRefs = useRef({})

  useEffect(() => {
    AMBIENT_SOUNDS.forEach((sound) => {
      const audio = new Audio(sound.audioUrl)
      audio.loop = true
      audio.volume = 0.5
      audioRefs.current[sound.id] = audio
    })

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [])

  const toggleSound = (soundId) => {
    const audio = audioRefs.current[soundId]
    if (!audio) return

    if (activeSounds.has(soundId)) {
      audio.pause()
      setActiveSounds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(soundId)
        return newSet
      })
      if (lastPlayedSound === soundId) {
        const remaining = Array.from(activeSounds).filter((id) => id !== soundId)
        setLastPlayedSound(remaining.length > 0 ? remaining[remaining.length - 1] : null)
      }
    } else {
      audio.play().catch((err) => console.log("Audio play error:", err))
      setActiveSounds((prev) => new Set(prev).add(soundId))
      setLastPlayedSound(soundId)
    }
  }

  const adjustVolume = (soundId, volume) => {
    const audio = audioRefs.current[soundId]
    if (audio) {
      audio.volume = volume
      setVolumes((prev) => ({ ...prev, [soundId]: volume }))
    }
  }

  const stopAll = () => {
    Object.values(audioRefs.current).forEach((audio) => audio.pause())
    setActiveSounds(new Set())
    setLastPlayedSound(null)
  }

  const getBackgroundGradient = () => {
    if (!lastPlayedSound) {
      return "linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #1f3a1f 100%)"
    }

    const sound = AMBIENT_SOUNDS.find((s) => s.id === lastPlayedSound)
    if (!sound) return "linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #1f3a1f 100%)"

    const baseColor = sound.color
    return `linear-gradient(135deg, ${baseColor}30 0%, ${baseColor}60 50%, ${baseColor}40 100%)`
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: getBackgroundGradient(),
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
        transition: "background 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Large floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${150 + Math.random() * 200}px`,
              height: `${150 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Animated waves */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute w-full h-full"
            style={{
              background: `radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.1) ${50 + i * 10}%, transparent 100%)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Ambient light rays */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute w-1 h-full origin-bottom"
            style={{
              left: `${(100 / 6) * i + 10}%`,
              background: "linear-gradient(to top, transparent, rgba(255,255,255,0.5), transparent)",
              transform: `rotate(${i * 15}deg)`,
            }}
            animate={{
              opacity: [0.05, 0.2, 0.05],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 6 + i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4 drop-shadow-lg">🎵</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight leading-tight text-balance">
            Ambient Soundscape
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in nature's symphony — blend calming sounds to create your perfect atmosphere
          </p>
          {lastPlayedSound && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
            >
              <span className="text-2xl">{AMBIENT_SOUNDS.find((s) => s.id === lastPlayedSound)?.icon}</span>
              <span className="text-white font-medium">
                {AMBIENT_SOUNDS.find((s) => s.id === lastPlayedSound)?.name}
              </span>
            </motion.div>
          )}
        </motion.div>

        {activeSounds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <button
              onClick={stopAll}
              className="px-8 py-3 rounded-full bg-red-600/90 hover:bg-red-700 text-white font-semibold backdrop-blur-sm border border-red-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Stop All Sounds
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {AMBIENT_SOUNDS.map((sound, index) => {
            const isActive = activeSounds.has(sound.id)
            const volume = volumes[sound.id] ?? 0.5

            return (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div
                  className="relative overflow-hidden rounded-2xl backdrop-blur-md transition-all duration-500 shadow-lg hover:shadow-2xl"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${sound.color}40 0%, ${sound.color}20 100%)`
                      : "rgba(255, 255, 255, 0.08)",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: isActive ? `${sound.color}80` : "rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
                      style={{ background: sound.color }}
                    />
                  )}

                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl drop-shadow-md">{sound.icon}</span>
                      <h3
                        className="text-xl font-semibold transition-colors duration-300"
                        style={{ color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.9)" }}
                      >
                        {sound.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => toggleSound(sound.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg mb-4"
                      style={{
                        background: isActive ? sound.color : "rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        transform: isActive ? "scale(1)" : "scale(0.98)",
                      }}
                    >
                      {isActive ? <Pause size={18} /> : <Play size={18} />}
                      {isActive ? "Playing" : "Play"}
                    </button>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between text-white/90 text-sm">
                          <span className="flex items-center gap-2">
                            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            Volume
                          </span>
                          <span className="font-semibold">{Math.round(volume * 100)}%</span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => adjustVolume(sound.id, Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${sound.color} 0%, ${sound.color} ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}
