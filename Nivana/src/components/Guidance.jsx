import { motion } from "framer-motion"
import "./Guidance.css"
import ButterFlyLayer from "./ButterFlyLayer"
import { useNavigate } from "react-router-dom"
import { Leaf, Wind, Heart, Shield, Waves, BookOpen, Music, Smile, TrendingUp } from "lucide-react"

export default function Guidance() {
  const navigate = useNavigate()

  const tips = [
    {
      title: "Mindful Breathing",
      desc: "A simple deep breathing exercise to calm your nervous system.",
      icon: Wind,
    },
    {
      title: "Stay Present",
      desc: "Ground yourself by noticing 5 things you can see, hear, or feel.",
      icon: Leaf,
    },
    {
      title: "Small Wins Matter",
      desc: "Celebrate even tiny progress — it builds momentum.",
      icon: Heart,
    },
    {
      title: "Healthy Boundaries",
      desc: "Learn to say no to protect your energy and mental clarity.",
      icon: Shield,
    },
  ]

  const features = [
    {
      title: "Guided Meditations",
      desc: "Short 2–10 minute audio practices for grounding and sleep.",
      icon: Waves,
      route: "/meditation",
    },
    {
      title: "Private Journaling",
      desc: "Daily prompts to reflect and build small habits.",
      icon: BookOpen,
      route: "/journal",
    },
    {
      title: "Ambient Soundscape",
      desc: "Nature-based themes and soft ambient audio for calm.",
      icon: Music,
      route: "/sounds",
    },
    {
      title: "Laughter Therapy",
      desc: "Light humor pieces designed for mood-lifting.",
      icon: Smile,
      route: "/laughter",
    },
    {
      title: "Mood Tracking",
      desc: "Visualize mood patterns across days and weeks.",
      icon: TrendingUp,
      route: "/dashboard",
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e8f0e6] via-[#f5f3ed] to-[#eef5f0] text-[#3d5a4a] font-sans relative overflow-hidden">
      <ButterFlyLayer />

      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce" style={{ animationDuration: "3s" }}>
        🌿
      </div>
      <div
        className="absolute top-20 right-20 text-5xl opacity-10 animate-bounce"
        style={{ animationDuration: "4s", animationDelay: "0.5s" }}
      >
        🍃
      </div>
      <div
        className="absolute bottom-20 left-1/4 text-4xl opacity-10 animate-bounce"
        style={{ animationDuration: "3.5s", animationDelay: "1s" }}
      >
        🌾
      </div>
      <div
        className="absolute bottom-32 right-1/3 text-5xl opacity-10 animate-bounce"
        style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}
      >
        🌱
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 p-8 md:p-12 lg:p-16 md:pl-80 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col gap-6"
        >

          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="inline-flex items-center gap-2 text-[#6b8e7a] mb-2">
              <Leaf className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wider uppercase">Natural Healing</span>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="self-start group inline-flex items-center gap-3 px-4 py-4 rounded-full bg-[#63d797] text-white font-semibold text-lg shadow-md hover:shadow-lg hover:bg-[#6b8e7a] hover:scale-105 transition-all duration-300"
              >
                <span>Return to dashboard</span>
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#3d5a4a] leading-tight text-balance">
              Return to Your Roots
            </h1>
            <p className="text-[#5a6f61] text-lg leading-relaxed max-w-2xl text-pretty">
              Nature has always been our greatest teacher. Explore gentle, earth-inspired practices designed to ground
              you and restore inner peace.
            </p>
          </div>

        </motion.div>

        {/* ================= TIPS SECTION ================= */}
        <div className="mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold mb-10 text-[#3d5a4a]"
          >
            Grounding Practices
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {tips.map((tip, index) => {
              const IconComponent = tip.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="shadow-pop-br group relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#c8d9ce]/50 hover:border-[#7a9d8a] hover:bg-white/90 transition-all duration-700 hover:shadow-lg hover:shadow-[#7a9d8a]/20"
                >
                  <div className="space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#e8f0e6] flex items-center justify-center text-[#6b8e7a] group-hover:bg-[#d8e7dd] transition-colors duration-500">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-focus-in text-xl font-semibold text-[#3d5a4a]">{tip.title}</h3>
                    <p className="text-focus-in text-sm text-[#5a6f61] leading-relaxed">{tip.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ================= FEATURES SECTION ================= */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold mb-10 text-[#3d5a4a]"
          >
            Nature's Healing Tools
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, index) => {
              const IconComponent = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true }}
                  onClick={() => navigate(item.route)}
                  className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-[#c8d9ce]/50 hover:border-[#455b4f] hover:bg-white/95 hover:shadow-xl hover:shadow-[#7a9d8a]/20 hover:scale-104 transition-all duration-700 cursor-pointer overflow-hidden"
                >
                  {/* Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Icon Area */}
                    <div className="w-16 h-16 rounded-2xl bg-[#e8f0e6] group-hover:bg-[#d8e7dd] flex items-center justify-center text-[#6b8e7a] group-hover:scale-110 transition-all duration-700">
                      <IconComponent className="w-8 h-8" />
                    </div>

                    {/* Text Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-[#3d5a4a] group-hover:text-[#6b8e7a] transition-colors duration-500">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#5a6f61] leading-relaxed">{item.desc}</p>
                    </div>

                    {/* Subtle Leaf Indicator */}
                    <div className="flex items-center text-[#6b8e7a] group-hover:text-[#7a9d8a] transition-colors pt-2">
                      <span className="text-sm font-medium">Explore</span>
                      <Leaf className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:rotate-12 transition-all duration-500" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Nature Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-24 text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-[#7a9d8a]" />
            <Leaf className="w-3 h-3 text-[#6b8e7a]" />
            <Leaf className="w-4 h-4 text-[#7a9d8a]" />
          </div>
          <p className="text-[#5a6f61] text-lg font-light italic max-w-xl mx-auto">
            "In every walk with nature, one receives far more than he seeks." — John Muir
          </p>
        </motion.div>
      </div>
    </div>
  )
}
