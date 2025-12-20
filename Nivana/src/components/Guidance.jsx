import React, { useState, useEffect } from "react"; // 1. Hooks import kiye
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 2. API call ke liye

export default function Guidance() {
  const navigate = useNavigate();
  
  // --- STATE FOR DYNAMIC RECOMMENDATIONS ---
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Ya Context se lein
        const token = localStorage.getItem("token");

        // Backend Route: Aapko ek route banana padega jo LATEST assessment return kare
        const res = await axios.get(`http://localhost:5000/api/assessments/latest/${userId}`, {
            headers: { Authorization: token }
        });

        if (res.data.success && res.data.data) {
             // Sirf wahi actions set karein jo backend ne bheje hain
             setRecommendations(res.data.data.recommendedActions || []);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);


  // --- STATIC CONTENT (Keep existing) ---
  const tips = [
    { title: "Mindful Breathing", desc: "A simple deep breathing exercise.", icon: "🌬️" },
    { title: "Stay Present", desc: "Ground yourself by noticing 5 things.", icon: "🎧" },
    { title: "Small Wins Matter", desc: "Celebrate even tiny progress.", icon: "🏆" },
    { title: "Healthy Boundaries", desc: "Learn to say no to protect energy.", icon: "🧱" },
  ];

  const features = [
    { title: "Guided Meditations", desc: "Short 2–10 minute audio practices.", icon: "🎧", route: "/meditation", color: "bg-purple-100" },
    { title: "Private Journaling", desc: "Daily prompts to reflect.", icon: "📓", route: "/journal", color: "bg-blue-100" },
    { title: "Ambient Soundscape", desc: "Nature-based themes.", icon: "🌿", route: "/sounds", color: "bg-green-100" },
    { title: "Laughter Therapy", desc: "Light humor pieces.", icon: "😄", route: "/laughter", color: "bg-yellow-100" },
    { title: "Mood Tracking", desc: "Visualize mood patterns.", icon: "📈", route: "/dashboard", color: "bg-pink-100" },
  ];

  const cardBaseStyle = "relative h-full p-6 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-start transition-all duration-300";
  const hoverStyle = "hover:shadow-md hover:-translate-y-1 cursor-pointer";

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-gray-800 font-sans">
      
      <div className="p-6 md:p-8 lg:p-12 md:pl-72 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Guidance</h1>
            <p className="text-gray-500 mt-2 text-base">
              Personalized tools and insights for your journey.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gray-900 text-white font-medium shadow hover:bg-gray-800 transition transform active:scale-95"
          >
            🏠 Dashboard
          </button>
        </motion.div>


        {/* 🔥🔥🔥 NEW SECTION: RECOMMENDED FOR YOU (Dynamic) 🔥🔥🔥 */}
        {recommendations.length > 0 && (
            <div className="mb-12">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    ✨ Recommended For You
                    <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Based on your history</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((action, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(action.actionUrl)}
                            // AGAR RECOMMENDED HAI TOH GREEN BORDER AUR BACKGROUND HIGHLIGHT KAREIN
                            className={`
                                relative p-6 rounded-2xl shadow-sm flex flex-col justify-start cursor-pointer transition-all hover:-translate-y-1
                                ${action.isRecommended ? "bg-green-50 border-2 border-green-500" : "bg-white border border-gray-200"}
                            `}
                        >
                            {/* 🏷️ BADGE LOGIC */}
                            {action.isRecommended && (
                                <div className="absolute -top-3 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    {action.recommendationTag || "Recommended"}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">
                                    {/* Icon logic: Type ke hisaab se icon dikhayein */}
                                    {action.type === 'emergency' ? '🆘' : action.type === 'content' ? '🎧' : '📝'}
                                </span>
                                <h3 className={`text-lg font-bold ${action.isRecommended ? "text-green-900" : "text-gray-800"}`}>
                                    {action.label}
                                </h3>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                                {action.isRecommended 
                                    ? "Selected specifically to help with your current mood." 
                                    : "A good habit to build."}
                            </p>
                            
                            <div className="mt-4 text-sm font-semibold text-gray-500 flex items-center group-hover:text-gray-900">
                                Start Now →
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}
        {/* 🔥🔥🔥 END NEW SECTION 🔥🔥🔥 */}


        {/* ================= TIPS SECTION (Static) ================= */}
        <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Tips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {tips.map((tip, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${cardBaseStyle} bg-white/60`}
                >
                <div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl mb-3">
                    {tip.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{tip.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
                </div>
                </motion.div>
            ))}
            </div>
        </div>

        {/* ================= FEATURES SECTION (Static) ================= */}
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Tools & Activities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => navigate(item.route)}
                className={`${cardBaseStyle} ${hoverStyle}`}
                >
                <div className={`w-14 h-14 rounded-2xl ${item.color || "bg-gray-100"} flex items-center justify-center text-2xl mb-4 shadow-sm`}>
                    {item.icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
                </motion.div>
            ))}
            </div>
        </div>

      </div>
    </div>
  );
}