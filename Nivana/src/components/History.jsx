import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaChevronRight, FaHistory, FaTimes, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import { apiService } from "../services/api";

// --- 1. Question Text Dictionary ---
const QUESTION_TITLES = {
  "q1": "How are you feeling today?",
  "fb_1": "Feeling nervous, anxious, or on edge?",
  "fb_2": "Not being able to stop or control worrying?",
  "fb_3": "Worrying too much about different things?",
  "fb_4": "Trouble relaxing?",
  "fb_5": "Little interest or pleasure in doing things?",
  "fb_6": "Feeling down, depressed, or hopeless?",
  "fb_7": "Feeling bad about yourself - or that you are a failure?",
  "fb_8": "Feeling overwhelmed by daily tasks?",
  "fb_9": "Trouble falling or staying asleep?",
  "fb_10": "Sleeping too much?",
  "fb_11": "Feeling tired or having little energy?",
  "fb_12": "Poor appetite or overeating?",
  "fb_13": "Trouble concentrating on things?",
  "fb_14": "Moving or speaking so slowly?",
  "fb_15": "Being so fidgety or restless?",
  "fb_16": "Brain fog or difficulty making decisions?",
  "fb_17": "Feeling isolated or lonely?",
  "fb_18": "Withdrawing from friends and family?",
  "fb_19": "Feeling irritable or annoyed with others?",
  "fb_20": "Has your mood affected your relationships?"
};

// --- 2. Answer Label Definitions (Smart Decoding) ---
const FREQUENCY_LABELS = {
  0: "Not at all",
  1: "Very rarely",
  2: "Several days",
  3: "More than half the days",
  4: "Almost every day",
  5: "Nearly every day"
};

const MOOD_LABELS = {
  1: "Rough 🌪️",
  2: "Low 🌧️",
  3: "Okay 🌤️",
  4: "Good 😊",
  5: "Great 🌟"
};

// --- Helper: Get Rich Answer Text (Number + Label) ---
const getRichAnswer = (questionId, val) => {
  if (val === null || val === undefined) return "Skipped";
  if (typeof val === 'object') {
    return `${val.value} - ${val.label}`;
  }
  if (questionId === 'q1' && MOOD_LABELS[val]) {
    return `${val} - ${MOOD_LABELS[val]}`;
  }
  if (!isNaN(val) && FREQUENCY_LABELS[val] !== undefined) {
    return `${val} - ${FREQUENCY_LABELS[val]}`;
  }
  return String(val);
};

// --- Helper: Get Question Text ---
const getDisplayText = (item, key) => {
  if (item.questionText) return item.questionText;
  if (item.title) return item.title;
  const id = item.questionId || key;
  if (QUESTION_TITLES[id]) return QUESTION_TITLES[id];
  return (id || "Unknown").replace(/_/g, ' ').replace('q ', 'Question ').replace('fb ', 'Assessment Q');
};

// --- Utility: Date Formatter (UPDATED & ROBUST) ---
function formatDate(iso) {
  // Check for undefined/null explicitly
  if (!iso) return { full: 'N/A', day: '--', month: '--', time: '--' };

  try {
    const date = new Date(iso);
    // Check for Invalid Date
    if (isNaN(date.getTime())) {
         return { full: 'Invalid Date', day: '--', month: '--', time: '--' };
    }

    return {
      full: date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      day: date.toLocaleString('en-US', { day: 'numeric' }),
      month: date.toLocaleString('en-US', { month: 'short' }),
      time: date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  } catch {
    return { full: iso, day: '', month: '', time: '' };
  }
}

// --- Utility: Score Color ---
const getScoreConfig = (score) => {
  if (!score) return { bg: "bg-stone-100", text: "text-stone-600", border: "border-stone-200" };
  if (score >= 4) return { bg: "bg-green-50", text: "text-green-800", border: "border-green-500" };
  if (score >= 3) return { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-400" };
  return { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300" };
};

// --- Skeleton Loader ---
const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-stone-100">
        <div className="w-12 h-12 bg-stone-100 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-100 rounded w-1/3"></div>
          <div className="h-3 bg-stone-100 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiService.getAssessmentHistory();
        // ✅ UPDATE 1: Sorting mein fallback lagaya (date OR createdAt)
        const sorted = Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)) 
          : [];
        setRecords(sorted);
      } catch (e) {
        console.error("Failed to load history", e);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getNormalizedAnswers = (assessment) => {
    if (!assessment.answers) return [];
    if (Array.isArray(assessment.answers)) {
      return assessment.answers.map(item => ({
        id: item.questionId,
        text: getDisplayText(item, item.questionId),
        val: getRichAnswer(item.questionId, item.value)
      }));
    }
    return Object.entries(assessment.answers).map(([key, val]) => ({
      id: key,
      text: getDisplayText({ questionId: key }, key),
      val: getRichAnswer(key, val)
    }));
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans selection:bg-teal-100">
      
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        
        {/* --- Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-teal-900 hover:border-teal-200 transition-all shadow-sm hover:shadow-md"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Your Journey</h1>
              <p className="text-stone-500 text-sm mt-1">A timeline of your mental wellness check-ins.</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/assessments")}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 transition-all"
          >
            <FaPlus className="text-sm group-hover:rotate-90 transition-transform" /> New Check-in
          </button>
        </motion.div>

        {/* --- Timeline Content --- */}
        <div className="relative pl-4 md:pl-8 border-l-2 border-green-100 space-y-8">
          
          {loading ? (
             <div className="pl-6"><SkeletonLoader /></div>
          ) : records.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="ml-6 flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300"
            >
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-3xl mb-4 text-stone-300">
                <FaHistory />
              </div>
              <h3 className="text-lg font-bold text-stone-900">No records found</h3>
              <p className="text-stone-400 text-sm mt-1 text-center">Your history will appear here after your first assessment.</p>
            </motion.div>
          ) : (
            records.map((r, index) => {
              // ✅ UPDATE 2: Fallback use kiya (date OR createdAt)
              const dateObj = formatDate(r.date || r.createdAt);
              const styles = getScoreConfig(r.summary?.avgScore);

              return (
                <motion.div
                  key={r.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelected(r)}
                  className="relative group ml-6"
                >
                  <div className={`absolute -left-[41px] md:-left-[59px] top-6 w-5 h-5 rounded-full border-4 border-[#FDFCF8] ${styles.bg.replace('bg-', 'bg-') || 'bg-stone-300'}`}></div>

                  <div className={`
                    p-5 bg-white rounded-2xl border border-stone-100 shadow-sm 
                    hover:shadow-md hover:border-teal-200 cursor-pointer transition-all duration-200 
                    flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                    border-l-4 ${styles.border}
                  `}>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-stone-50 rounded-xl border border-stone-100 text-teal-800 shrink-0">
                        <span className="text-xs font-bold uppercase text-stone-400">{dateObj.month}</span>
                        <span className="text-xl font-bold leading-none">{dateObj.day}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-teal-900 text-lg">Daily Check-in</h3>
                          {/* Note: 'r.day' might also be missing, but 'dateObj' logic above is more critical */}
                          {r.day === new Date().toISOString().slice(0,10) && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">New</span>
                          )}
                        </div>
                        <div className="text-sm text-stone-400 font-medium">
                          {dateObj.time} • {r.summary?.avgScore ? `Score: ${r.summary.avgScore}/5` : 'Completed'}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex w-10 h-10 rounded-full bg-white border border-stone-100 items-center justify-center text-stone-400 group-hover:bg-teal-600 group-hover:text-white group-hover:border-transparent transition-all">
                       <FaChevronRight className="text-xs" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* --- Detail Modal --- */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" 
              onClick={() => setSelected(null)} 
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-50 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-stone-50 p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-teal-900">Session Details</h3>
                  {/* ✅ UPDATE 3: Modal Header date fix */}
                  <p className="text-sm text-stone-500 mt-1">{formatDate(selected.date || selected.createdAt).full}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-stone-400 hover:bg-stone-100 transition">
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                
                {/* Score */}
                {selected.summary && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Wellness Score</div>
                      <div className="text-3xl font-extrabold text-teal-900">{selected.summary.avgScore} <span className="text-lg font-medium text-teal-700/60">/ 5</span></div>
                    </div>
                    <div className="h-12 w-12 bg-white/60 rounded-full flex items-center justify-center text-2xl shadow-sm">📊</div>
                  </div>
                )}

                {/* Guidance */}
                {selected.llmAnalysis && (selected.llmAnalysis.guidance || selected.llmAnalysis.guidanceText) && (
                   <div className="space-y-3">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                        <FaCheckCircle className="text-teal-500" /> AI Insights
                      </h4>
                      <div className="p-5 rounded-2xl bg-teal-50 text-teal-900 text-sm leading-7 border border-teal-100">
                        {selected.llmAnalysis.guidanceText || selected.llmAnalysis.guidance}
                      </div>
                   </div>
                )}

                {/* Responses List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                    <FaClipboardList /> Your Responses
                  </h4>
                  <div className="grid gap-3">
                    {getNormalizedAnswers(selected).map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="text-xs font-bold text-teal-800/70 mb-1.5 leading-snug">
                          {item.text}
                        </div>
                        <div className="text-stone-800 font-medium text-sm">
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-stone-100 bg-stone-50">
                <button 
                  onClick={() => setSelected(null)}
                  className="w-full py-3 rounded-xl bg-white border border-stone-200 font-bold text-stone-600 hover:bg-stone-100 hover:text-teal-900 transition shadow-sm"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}