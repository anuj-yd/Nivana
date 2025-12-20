"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Heart, RefreshCw, Sparkles, Smile, Timer } from "lucide-react"

const FUNNY_CONTENT = {
  jokes: [
    {
      id: 1,
      category: "Light",
      setup: "Why don't scientists trust atoms?",
      punchline: "Because they make up everything! 😄",
      mood: "cheerful",
    },
    {
      id: 2,
      category: "Silly",
      setup: "What do you call a bear with no teeth?",
      punchline: "A gummy bear! 🐻",
      mood: "playful",
    },
    {
      id: 3,
      category: "Wordplay",
      setup: "Why did the scarecrow win an award?",
      punchline: "He was outstanding in his field! 🌾",
      mood: "witty",
    },
    {
      id: 4,
      category: "Wholesome",
      setup: "What did the ocean say to the beach?",
      punchline: "Nothing, it just waved! 🌊",
      mood: "calm",
    },
    {
      id: 5,
      category: "Light",
      setup: "Why can't you hear a pterodactyl using the bathroom?",
      punchline: "Because the 'P' is silent! 🦕",
      mood: "cheerful",
    },
  ],

  exercises: [
    {
      id: 1,
      title: "Smile Mirror",
      description: "Look in a mirror and hold the biggest, silliest smile for 30 seconds",
      duration: "30 sec",
      durationSeconds: 30,
      icon: "😁",
      color: "#fbbf24",
    },
    {
      id: 2,
      title: "Laugh Out Loud",
      description: "Start with fake laughter - 'Ha ha ha!' - Your brain won't know the difference!",
      duration: "1 min",
      durationSeconds: 60,
      icon: "😂",
      color: "#fb923c",
    },
    {
      id: 3,
      title: "Funny Faces",
      description: "Make the goofiest faces you can. No one's watching!",
      duration: "2 min",
      durationSeconds: 120,
      icon: "🤪",
      color: "#f472b6",
    },
    {
      id: 4,
      title: "Giggle Meditation",
      description: "Close your eyes and remember the funniest moment of your life",
      duration: "3 min",
      durationSeconds: 180,
      icon: "🥰",
      color: "#a78bfa",
    },
  ],

  quotes: [
    { text: "Laughter is the shortest distance between two people.", author: "Victor Borge", emoji: "💫" },
    { text: "A day without laughter is a day wasted.", author: "Charlie Chaplin", emoji: "✨" },
    { text: "Laughter is an instant vacation.", author: "Milton Berle", emoji: "🏖️" },
    {
      text: "You don't stop laughing because you grow old. You grow old because you stop laughing.",
      author: "Maurice Chevalier",
      emoji: "🌟",
    },
  ],
}

const getRandomJoke = async () => {
  setLoadingJoke(true);

  try {
    const res = await fetch("http://localhost:5000/api/laughter/joke");
    const data = await res.json();

    if (data.success) {
      setCurrentJoke({
        id: Date.now(),
        ...data.joke
      });
      setShowPunchline(false);
    }
  } catch (err) {
    setCurrentJoke({
      id: Date.now(),
      category: "Light",
      setup: "Why did the backend laugh?",
      punchline: "Because it finally worked 😂",
      mood: "cheerful"
    });
    setShowPunchline(false);
  } finally {
    setLoadingJoke(false);
  }
};


export default function LaughterTherapy() {
  const [currentJoke, setCurrentJoke] = useState(null)
  const [showPunchline, setShowPunchline] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [laughCount, setLaughCount] = useState(0)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [currentQuote, setCurrentQuote] = useState(FUNNY_CONTENT.quotes[0])
  const [confetti, setConfetti] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loadingJoke, setLoadingJoke] = useState(false)
  const [lastJoke, setLastJoke] = useState(null);


  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("laughterTherapy")) || { favorites: [], count: 0 }
    setFavorites(saved.favorites || [])
    setLaughCount(saved.count || 0)
  }, [])

  useEffect(() => {
    let interval
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            triggerConfetti()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timeLeft])

  const getRandomJoke = async () => {
  setLoadingJoke(true);

  try {
    let attempts = 0;
    let newJoke = null;

    while (attempts < 5) {
      const res = await fetch("http://localhost:5000/api/laughter/joke");
      const data = await res.json();

      if (data.success) {
        newJoke = data.joke;

        // 🔥 repeat check
        if (newJoke.setup !== lastJoke) {
          break;
        }
      }

      attempts++;
    }

    if (newJoke) {
      setCurrentJoke({ id: Date.now(), ...newJoke });
      setLastJoke(newJoke.setup);
      setShowPunchline(false);
    }

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingJoke(false);
  }
};


  const revealPunchline = () => {
    setShowPunchline(true)
    setLaughCount((prev) => {
      const newCount = prev + 1
      const saved = JSON.parse(localStorage.getItem("laughterTherapy")) || {}
      localStorage.setItem("laughterTherapy", JSON.stringify({ ...saved, count: newCount }))
      return newCount
    })

    if (laughCount > 0 && laughCount % 5 === 0) {
      triggerConfetti()
    }
  }

  const triggerConfetti = () => {
    setConfetti(true)
    setTimeout(() => setConfetti(false), 3000)
  }

  const toggleFavorite = (jokeId) => {
    const newFavorites = favorites.includes(jokeId) ? favorites.filter((id) => id !== jokeId) : [...favorites, jokeId]

    setFavorites(newFavorites)
    const saved = JSON.parse(localStorage.getItem("laughterTherapy")) || {}
    localStorage.setItem("laughterTherapy", JSON.stringify({ ...saved, favorites: newFavorites }))
  }

  const getRandomQuote = () => {
    const randomQuote = FUNNY_CONTENT.quotes[Math.floor(Math.random() * FUNNY_CONTENT.quotes.length)]
    setCurrentQuote(randomQuote)
  }

  const startExerciseTimer = (exercise) => {
    setTimeLeft(exercise.durationSeconds)
    setTimerRunning(true)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const cardBaseStyle =
    "relative p-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 text-gray-800 font-sans overflow-x-hidden relative">
      {/* Confetti Effect */}
      <AnimatePresence>
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                  scale: 0,
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 360,
                  scale: [0, 1, 1, 0.5],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut",
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ["#fbbf24", "#fb923c", "#f472b6", "#a78bfa", "#34d399"][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating Emojis Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {["😊", "😄", "😁", "🎉", "✨", "💫", "🌟"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Content Wrapper */}
      <div className="p-6 md:p-8 lg:p-12 md:pl-72 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="text-6xl mb-4">😂</div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600">
            Laughter Therapy
          </h1>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
            Science-backed humor to boost your mood. Laughter releases endorphins and reduces stress! 🧠✨
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg">
              <div className="text-2xl font-bold">{laughCount}</div>
              <div className="text-xs opacity-90">Laughs Today</div>
            </div>
            <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 text-white shadow-lg">
              <div className="text-2xl font-bold">{favorites.length}</div>
              <div className="text-xs opacity-90">Favorites</div>
            </div>
          </div>
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBaseStyle} mb-8 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-3xl mb-3">{currentQuote.emoji}</div>
              <p className="text-lg font-medium text-gray-800 italic mb-2">"{currentQuote.text}"</p>
              <p className="text-sm text-gray-600">— {currentQuote.author}</p>
            </div>
            <button onClick={getRandomQuote} className="p-2 rounded-lg bg-white/60 hover:bg-white transition-colors">
              <RefreshCw size={20} className="text-purple-600" />
            </button>
          </div>
        </motion.div>

        {/* Joke of the Moment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${cardBaseStyle} bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200 min-h-[280px] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Daily Joke</h2>
                  {currentJoke && (
                    <span className="px-3 py-1 rounded-full bg-white/60 text-sm font-medium text-orange-700">
                      {currentJoke.category}
                    </span>
                  )}
                </div>

                {!currentJoke ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎭</div>
                    <p className="text-gray-600 mb-6">Ready for a good laugh?</p>
                    <button
                      onClick={getRandomJoke}
                      disabled={loadingJoke}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingJoke ? "Loading..." : "Tell Me a Joke! 😄"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xl font-medium text-gray-800">{currentJoke.setup}</p>

                    <AnimatePresence>
                      {showPunchline ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div className="p-4 rounded-xl bg-white/60 border-2 border-orange-300">
                            <p className="text-2xl font-bold text-orange-700">{currentJoke.punchline}</p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => toggleFavorite(currentJoke.id)}
                              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                                favorites.includes(currentJoke.id)
                                  ? "bg-red-500 text-white"
                                  : "bg-white/60 text-gray-700 hover:bg-white"
                              }`}
                            >
                              <Heart
                                size={18}
                                className="inline mr-2"
                                fill={favorites.includes(currentJoke.id) ? "white" : "none"}
                              />
                              {favorites.includes(currentJoke.id) ? "Loved!" : "Love It"}
                            </button>

                            <button
                              onClick={getRandomJoke}
                              disabled={loadingJoke}
                              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                              <RefreshCw size={18} className="inline mr-2" />
                              {loadingJoke ? "Loading..." : "Next Joke"}
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={revealPunchline}
                          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          Reveal Punchline! 🎉
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Laugh Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${cardBaseStyle} bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200`}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Laugh Goal</h3>
              <p className="text-sm text-gray-600 mb-4">Scientists recommend 15 laughs/day</p>

              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(laughCount / 15) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{Math.min(laughCount, 15)}/15</span>
                </div>
              </div>

              {laughCount >= 15 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-400 text-white font-medium"
                >
                  🎉 Goal Achieved!
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Laughter Exercises */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Sparkles className="text-yellow-500" />
            Laughter Exercises
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FUNNY_CONTENT.exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setSelectedExercise(exercise)}
                className="cursor-pointer relative p-5 rounded-2xl bg-white/90 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderTopColor: exercise.color,
                  borderTopWidth: "4px",
                }}
              >
                <div className="text-4xl mb-3">{exercise.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{exercise.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">{exercise.duration}</span>
                  <Play size={16} className="text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${cardBaseStyle} bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Why Laughter Therapy Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-white/60">
                  <div className="font-semibold text-gray-800 mb-1">🧠 Reduces Stress</div>
                  <p className="text-sm text-gray-600">Lowers cortisol and releases feel-good endorphins</p>
                </div>
                <div className="p-3 rounded-lg bg-white/60">
                  <div className="font-semibold text-gray-800 mb-1">❤️ Boosts Immunity</div>
                  <p className="text-sm text-gray-600">Increases infection-fighting antibodies</p>
                </div>
                <div className="p-3 rounded-lg bg-white/60">
                  <div className="font-semibold text-gray-800 mb-1">😊 Improves Mood</div>
                  <p className="text-sm text-gray-600">Natural antidepressant and anxiety reducer</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setSelectedExercise(null)
              setTimerRunning(false)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedExercise.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{selectedExercise.title}</h3>
                <p className="text-gray-600 mb-6">{selectedExercise.description}</p>

                {timerRunning ? (
                  <div className="mb-6">
                    <div className="relative w-40 h-40 mx-auto mb-4">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke={selectedExercise.color}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(timeLeft / selectedExercise.durationSeconds) * 439.8} 439.8`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-800">{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Keep going! You're doing great!</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 mb-6">
                    <div className="text-3xl font-bold" style={{ color: selectedExercise.color }}>
                      {selectedExercise.duration}
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedExercise(null)
                      setTimerRunning(false)
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>

                  {!timerRunning ? (
                    <button
                      onClick={() => startExerciseTimer(selectedExercise)}
                      className="flex-1 px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${selectedExercise.color}, ${selectedExercise.color}dd)`,
                      }}
                    >
                      <Timer size={18} className="inline mr-2" />
                      Start Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setTimerRunning(false)
                        setLaughCount((prev) => {
                          const newCount = prev + 1
                          const saved = JSON.parse(localStorage.getItem("laughterTherapy")) || {}
                          localStorage.setItem("laughterTherapy", JSON.stringify({ ...saved, count: newCount }))
                          return newCount
                        })
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-medium shadow-lg hover:bg-red-600 transition-all"
                    >
                      Stop
                    </button>
                  )}
                </div>

                {timeLeft === 0 && !timerRunning && selectedExercise && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => {
                      setLaughCount((prev) => {
                        const newCount = prev + 1
                        const saved = JSON.parse(localStorage.getItem("laughterTherapy")) || {}
                        localStorage.setItem("laughterTherapy", JSON.stringify({ ...saved, count: newCount }))
                        return newCount
                      })
                      setSelectedExercise(null)
                      triggerConfetti()
                    }}
                    className="w-full mt-3 px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all bg-green-500 hover:bg-green-600"
                  >
                    <Smile size={18} className="inline mr-2" />
                    Complete Exercise
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
