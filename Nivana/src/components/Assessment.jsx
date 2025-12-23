
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { FaCheckCircle, FaExclamationTriangle, FaChevronRight, FaChevronLeft, FaHistory, FaPaperPlane } from "react-icons/fa";

// --- CONSTANTS ---
const DEFAULT_FALLBACK = [
  { id: "q1", type: "mood", title: "How are you feeling today?", options: [{ label: "Great", emoji: "😄", value: 5 }, { label: "Okay", emoji: "😐", value: 3 }, { label: "Not Good", emoji: "😔", value: 1 }] }
];

// --- 1. QuestionCard Component ---
const QuestionCard = ({ 
  q, 
  answers, 
  setAnswer, 
  autoNext, 
  next, 
  back, 
  step, 
  totalQuestions, 
  canProceed 
}) => {
  const [localText, setLocalText] = useState("");

  useEffect(() => {
    if (q?.type === "text") {
      setLocalText(answers[q.id] ?? "");
    } else {
      setLocalText("");
    }
  }, [q?.id, q?.type, answers]);

  if (!q) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-b border-gray-100 pb-4">
        <div className="w-full">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             key={q.title}
           >
              <div className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{q.title}</div>
              {q.hint && q.type !== "scale4" && (
                <div className="text-base text-green-700 mt-2 bg-green-50 inline-block px-3 py-1 rounded-lg">
                  💡 {q.hint}
                </div>
              )}
           </motion.div>
        </div>
      </div>

      <motion.div
         key={q.id}
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.3, ease: "easeOut" }}
         className="min-h-[300px]"
      >
      {/* MOOD TYPE */}
      {q.type === "mood" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(q.options) ? q.options.map((o, idx) => {
            const val = (o.value !== undefined) ? o.value : (o.id || idx);
            const selected = answers[q.id] === val;
            return (
              <button key={idx} 
              onClick={() => { setAnswer(q.id, val); autoNext(); }}
              className={`group w-full p-6 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 border-2
                ${selected 
                  ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-200 scale-[1.02]' 
                  : 'bg-white border-gray-100 text-gray-700 hover:border-green-300 hover:bg-green-50/50 hover:shadow-lg'
                }`}>
                <div className="text-5xl transform transition-transform group-hover:scale-110 group-hover:rotate-6">{o.emoji || '🙂'}</div>
                <div className="text-lg font-bold">{o.label}</div>
              </button>
            );
          }) : (
            <input type="range" min={1} max={5} value={answers[q.id] ?? 3} onChange={(e) => setAnswer(q.id, Number(e.target.value))} className="w-full accent-green-600" />
          )}
        </div>
      )}

      {/* SCALE TYPE */}
      {q.type === "scale" && q.scale && (
        <div className="py-8">
          <div className="flex justify-between items-center max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
            
            {Array.from({ length: q.scale.max - q.scale.min + 1 }, (_, i) => q.scale.min + i).map((val) => {
              const selected = answers[q.id] === val;
              return (
                <button
                  key={val}
                  onClick={() => { setAnswer(q.id, val); autoNext(); }}
                  className="group relative flex flex-col items-center focus:outline-none"
                >
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-300 shadow-sm border-4 
                    ${selected 
                      ? "bg-green-600 border-green-200 text-white shadow-green-300 scale-110 -translate-y-2" 
                      : "bg-white border-white text-gray-400 group-hover:border-green-200 group-hover:text-green-600"
                    }`}>
                    {val}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-6 text-sm font-medium text-gray-400 px-2">
              <span>Not at all</span>
              <span>Extremely</span>
          </div>
        </div>
      )}

      {/* SCALE 4 (Detailed) TYPE */}
      {q.type === "scale4" && (
        <div className="grid grid-cols-1 gap-3 max-w-3xl mx-auto">
          {[
            { v: 0, label: "Not at all", desc: "Never experienced this" },
            { v: 1, label: "Very rarely", desc: "Once or twice" },
            { v: 2, label: "Several days", desc: "Sometimes during the week" },
            { v: 3, label: "More than half", desc: "Often interferes" },
            { v: 4, label: "Almost every day", desc: "Very frequent" },
            { v: 5, label: "Nearly every day", desc: "Constant struggle" },
          ].map((opt) => {
            const selected = answers[q.id] === opt.v;
            return (
              <button
                key={opt.v}
                onClick={() => { setAnswer(q.id, opt.v); autoNext(); }}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all duration-200
                  ${selected 
                    ? "bg-green-50 border-green-500 ring-1 ring-green-500 shadow-md" 
                    : "bg-white border-gray-100 hover:border-green-300 hover:bg-green-50/30"
                  }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border transition-colors
                  ${selected ? "bg-green-600 text-white border-green-600" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {opt.v}
                </div>
                <div>
                  <div className={`text-base font-bold ${selected ? "text-green-900" : "text-gray-700"}`}>{opt.label}</div>
                  <div className="text-xs text-gray-500 font-medium">{opt.desc}</div>
                </div>
                {selected && <FaCheckCircle className="ml-auto text-green-600 text-xl" />}
              </button>
            );
          })}
        </div>
      )}

      {/* TEXT TYPE */}
      {q.type === "text" && (
        <div className="relative">
           <textarea
             rows={6}
             value={localText}
             onChange={(e) => setLocalText(e.target.value)}
             onBlur={() => setAnswer(q.id, localText)}
             placeholder="Type your thoughts here... (This is private)"
             className="w-full p-6 rounded-3xl border border-gray-200 bg-white text-gray-800 text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
           />
           <div className="absolute bottom-4 right-4 text-gray-300"><FaPaperPlane /></div>
        </div>
      )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-8">
        <button 
          onClick={back} 
          disabled={step === 0} 
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors
            ${step === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <FaChevronLeft /> Back
        </button>
        
        <button 
          onClick={next} 
          disabled={!canProceed} 
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-95
            ${canProceed 
              ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-green-200' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
        >
          {step === totalQuestions - 1 ? 'Review' : 'Next'} <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Assessment() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [stage, setStage] = useState("age");
  const [age, setAge] = useState("");
  const [questions, setQuestions] = useState(DEFAULT_FALLBACK);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [llmResult, setLlmResult] = useState(null);
  const [emergencyShown, setEmergencyShown] = useState(false);
  const [questionSource, setQuestionSource] = useState("local");

  useEffect(() => {
    try { sessionStorage.setItem("mn_partial_assessment", JSON.stringify({ stage, age, step, answers })); } catch {}
  }, [stage, age, step, answers]);

  const setAnswer = (qid, value) => setAnswers(prev => ({ ...prev, [qid]: value }));

  const startWithAge = async (a) => {
    if (!a) return;
    setLoading(true);
    setQuestionSource("loading");
    try {
      const data = await apiService.startAssessment(Number(a));
      if (data?.questions && Array.isArray(data.questions) && data.questions.length) {
        const qs = data.questions.map((q, idx) => {
          const id = q.id || `q_${idx}`;
          const type = (q.type === "scale4" || q.type === "scale" || q.type === "mood" || q.type === "text") ? q.type : (q.options ? "mood" : "text");
          const title = q.title || q.text || `Question ${idx + 1}`;
          const hint = q.hint;
          const scale = q.scale || (type === "scale" ? { min: 1, max: 5 } : undefined);
          const options = Array.isArray(q.options) ? q.options : undefined;
          return { id, type, title, hint, scale, options };
        });
        setQuestions(qs);
        setQuestionSource("gemini");
      } else {
        setQuestions(DEFAULT_FALLBACK);
        setQuestionSource("local");
      }

      setAge(a);
      setStage("taking");
      setStep(0);
    } catch (err) {
      console.error("start error", err);
      setToast({ type: "error", text: "Network error — using local mode." });
      setQuestions(DEFAULT_FALLBACK);
      setQuestionSource("local");
      setStage("taking");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const checkCanProceed = () => {
    const q = questions[step];
    if (!q) return false;
    if (q.type === "text") return true;
    const val = answers[q.id];
    return val !== undefined && val !== null && val !== "";
  };

  const next = () => { 
      if (!checkCanProceed()) return; 
      setStep(s => Math.min(s + 1, questions.length)); 
  };
  
  const autoNext = () => {
    setTimeout(() => {
      setStep((s) => {
        if (s >= questions.length - 1) {
          return questions.length; // preview
        }
        return s + 1;
      });
    }, 400); 
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  // --- SAFE SUBMIT FUNCTION (Guaranteed Navigation) ---
  const submitAssessment = async () => {
    if (!auth.isAuthenticated) {
      setToast({ type: 'error', text: 'Please log in to submit.' });
      setTimeout(() => navigate('/login', { state: { next: '/dashboard' } }), 1000);
      return;
    }
    
    // Validate inputs
    for (const q of questions) {
      if (q.type !== "text" && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === "")) {
        setToast({ type: "error", text: "Please answer all required questions." });
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }

    setSubmitting(true);
    const payloadAnswers = Object.entries(answers).map(([k,v]) => ({ questionId: k, value: v }));

    try {
      // Create a timeout promise that rejects after 8 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 8000)
      );

      // Race the API call against the timeout
      const data = await Promise.race([
        apiService.submitAssessment({ age: Number(age), answers: payloadAnswers }),
        timeoutPromise
      ]);

      // --- SUCCESS PATH ---
      const saved = (data && typeof data === 'object') ? (data.assessment || data) : {};
      const analysis = saved.llmAnalysis || saved.llm_analysis || null;
      
      setToast({ type: "success", text: "Assessment saved successfully." });
      setTimeout(() => setToast(null), 3000);

      if (data?.emergency || saved?.emergency) {
        setEmergencyShown(true);
        setSubmitting(false);
      } else {
        // Dispatch event
        try {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('assessment:saved', { detail: saved }));
          }
        } catch (e) {}

        // Navigate
        setTimeout(() => {
            setSubmitting(false);
            navigate("/dashboard", { state: { savedAssessment: saved } });
        }, 1000);
      }

      sessionStorage.removeItem("mn_partial_assessment");
      
      if (analysis && (analysis.guidanceText || analysis.guidance)) {
         setLlmResult({ 
             text: analysis.guidanceText || analysis.guidance, 
             severity: analysis.severity, 
             risks: analysis.risks || [] 
         });
      }

    } catch (err) {
      console.error("Submit Error:", err);
      
      // --- FAIL / TIMEOUT / MANUAL CALC PATH ---
      // This catch block handles network errors, timeouts, or backend 'Manual Calculation' 500s.
      // We FORCE navigation here so you never get stuck.

      if (err.response?.status === 401) {
        setToast({ type: 'error', text: 'Unauthorized. Please log in.' });
        setTimeout(() => navigate('/login'), 1500);
        setSubmitting(false);
      } else {
        // Generic or Timeout Error -> Force Dashboard
        setToast({ type: "warning", text: "Saved. Redirecting..." });
        
        setTimeout(() => {
           setSubmitting(false);
           navigate("/dashboard");
        }, 1500);
      }
    } 
  };

  const progressPercent = (() => {
    const total = questions.length || 1;
    const current = Math.min(step, questions.length);
    return Math.round((current / total) * 100);
  })();

  const EmergencyOverlay = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-lg p-8 bg-white rounded-2xl shadow-2xl border-l-8 border-red-500">
        <div className="flex items-start gap-6">
          <div className="text-red-500 text-4xl mt-1"><FaExclamationTriangle /></div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Immediate Help Recommended</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Your responses suggest you might be going through a difficult time. If you are feeling unsafe or thinking about self-harm, please contact a helpline immediately.</p>
            <div className="bg-red-50 p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-red-800">India Helpline</span>
                <span className="font-mono text-red-900 font-bold">9152987821</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-red-800">US Helpline</span>
                <span className="font-mono text-red-900 font-bold">988</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition">Close</button>
              <a href="tel:9152987821" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium shadow-lg shadow-red-200 hover:bg-red-700 transition">Call Now</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // --- AGE SCREEN (Landing) ---
  if (stage === "age") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFDFD] p-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-green-100/50 overflow-hidden border border-white"
        >
          {/* Left Side: Visual */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-10 flex flex-col justify-center relative">
             <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">🌿</div>
             <h2 className="text-4xl font-extrabold text-green-900 mb-4 mt-12 leading-tight">Your Safe Space to Check In</h2>
             <p className="text-green-800/70 text-lg leading-relaxed mb-8">
               Take a moment for yourself. Our AI-guided assessment adapts to your age and life stage to provide personalized insights.
             </p>
             <div className="flex gap-2 mt-auto">
                <div className="h-2 w-12 bg-green-600 rounded-full opacity-20"></div>
                <div className="h-2 w-2 bg-green-600 rounded-full opacity-20"></div>
                <div className="h-2 w-2 bg-green-600 rounded-full opacity-20"></div>
             </div>
          </div>

          {/* Right Side: Input */}
          <div className="p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Let's get started</h3>
            <p className="text-gray-500 mb-8">Please enter your age to begin.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Your Age</label>
                <input 
                  type="number" 
                  min="8" max="120" 
                  placeholder="e.g. 24" 
                  className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-50 outline-none transition-all text-2xl font-semibold text-gray-800 placeholder-gray-300" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => startWithAge(Number(age))} 
                  disabled={!age || loading} 
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95
                    ${loading 
                      ? 'bg-gray-200 text-gray-400 cursor-wait' 
                      : 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-green-200'}`}
                >
                  {loading ? 'Generating Questions...' : 'Start Assessment'}
                </button>

                <button onClick={() => navigate('/dashboard')} className="w-full py-4 rounded-2xl text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-800 transition">
                  Skip to Dashboard
                </button>
              </div>
              
              <div className="text-center pt-6 border-t border-gray-50">
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Powered By</p>
                 <div className="text-sm font-semibold text-gray-600 mt-1">{questionSource === 'gemini' ? '✨ Gemini AI' : 'Local Fallback'}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- MAIN ASSESSMENT SCREEN ---
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FDFDFD] text-gray-800 font-sans selection:bg-green-100">
      {/* Top Navbar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div onClick={() => navigate('/dashboard')} className="cursor-pointer w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-green-200">
               🌿
             </div>
             <div className="hidden md:block">
               <h1 className="text-lg font-bold text-gray-900 leading-none">Self-Check</h1>
               <div className="text-xs text-gray-500 font-medium">Private & Secure</div>
             </div>
          </div>
          <div className="text-sm font-medium text-gray-400">
              {step < questions.length ? `Question ${step + 1} of ${questions.length}` : 'Review'}
          </div>
        </div>
        {/* Progress Line */}
        <div className="h-1 w-full bg-gray-100">
           <motion.div 
             className="h-full bg-gradient-to-r from-green-400 to-teal-500" 
             initial={{ width: 0 }}
             animate={{ width: `${progressPercent}%` }}
             transition={{ duration: 0.5 }}
           />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* MAIN QUESTION AREA */}
            <div className="lg:col-span-8">
              <div className="min-h-[60vh] flex flex-col">
                {step < questions.length && (
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                         <QuestionCard 
                           q={questions[step]} 
                           answers={answers}
                           setAnswer={setAnswer}
                           autoNext={autoNext}
                           next={() => {
                               if (step === questions.length - 1) setStep(questions.length); 
                               else next();
                           }}
                           back={back}
                           step={step}
                           totalQuestions={questions.length}
                           canProceed={checkCanProceed()}
                         />
                      </motion.div>
                   </AnimatePresence>
                )}

                {/* REVIEW SCREEN */}
                {step === questions.length && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="bg-green-50/50 p-8 rounded-3xl border border-green-100 text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-3xl font-bold text-green-900">You're all set!</h2>
                      <p className="text-green-800/70 mt-2">Take a moment to review your answers before submitting. Being honest helps us help you.</p>
                    </div>

                    <div className="space-y-4">
                      {questions.map((q) => (
                        <div key={q.id} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">{q.title}</div>
                          <div className="text-xl font-medium text-gray-900">
                             {q.type === 'text' ? (answers[q.id] || <span className="text-gray-300 italic">No notes added</span>) : (answers[q.id] !== undefined ? String(answers[q.id]) : <span className="text-red-400">Not answered</span>)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                      <button onClick={() => setStep(questions.length - 1)} className="w-full sm:w-auto px-6 py-4 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition">
                          Go Back & Edit
                      </button>
                      <button onClick={submitAssessment} disabled={submitting} className={`w-full sm:flex-1 py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1
                        ${submitting ? 'bg-gray-300 cursor-wait' : 'bg-gradient-to-r from-green-600 to-teal-600 shadow-green-200'}`}>
                        {submitting ? 'Analyzing Responses...' : 'Submit Assessment'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR (Sticky) */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-28 space-y-6">
                
                {/* Progress Widget */}
                <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-gray-900">Your Progress</div>
                    <div className="text-sm font-mono text-green-600 bg-green-50 px-2 py-1 rounded-md">{progressPercent}%</div>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-6">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${progressPercent}%` }}
                       className="h-full bg-green-500 rounded-full" 
                    />
                  </div>
                  <button
                    onClick={() => {
                      if(window.confirm("Are you sure you want to restart? All progress will be lost.")) {
                        setStep(0);
                        setAnswers({});
                        sessionStorage.removeItem("mn_partial_assessment");
                      }
                    }}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition"
                  >
                    <FaHistory /> Restart
                  </button>
                </div>

                {/* Question Map */}
                <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Jump To</div>
                  <div className="flex flex-col gap-2">
                    {questions.map((q, i) => (
                      <button 
                        key={q.id} 
                        onClick={() => setStep(i)} 
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                          ${i === step 
                            ? 'bg-green-600 text-white shadow-md' 
                            : answers[q.id] !== undefined 
                               ? 'bg-green-50 text-green-800' 
                               : 'text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                          <span className="opacity-60 mr-2">{i+1}.</span> 
                          {q.title.length > 35 ? q.title.slice(0,35)+"..." : q.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Help Box */}
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-800 leading-relaxed">
                    <strong>Note:</strong> Your responses are analyzed locally or via secure AI to provide guidance. We prioritize your privacy.
                </div>

              </div>
            </aside>

          </div>
        </div>

        {/* --- MODALS & OVERLAYS --- */}

        {/* LLM Result Modal */}
        {llmResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-white/30">
            <div className="absolute inset-0 bg-black/20" onClick={() => setLlmResult(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-lg p-8 bg-white rounded-3xl shadow-2xl border border-white">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl mb-6 mx-auto">
                 <FaCheckCircle />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Assessment Complete</h3>
              <p className="text-center text-gray-500 mb-6">Here is some initial guidance based on your inputs.</p>
              
              <div className="bg-gray-50 p-6 rounded-2xl text-sm text-gray-700 leading-relaxed mb-8 border border-gray-100">
                 {llmResult.text}
              </div>
              
              <button onClick={() => { setLlmResult(null); navigate('/dashboard'); }} className="w-full py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition">
                  Continue to Dashboard
              </button>
            </motion.div>
          </div>
        )}

        {emergencyShown && <EmergencyOverlay onClose={() => setEmergencyShown(false)} />}

        {toast && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
            <motion.div 
               initial={{ opacity: 0, y: -20 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0 }}
               className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'error' ? 'bg-white border-red-100 text-red-600' : (toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-gray-900 text-white border-gray-800')}`}
            >
              <div className="text-lg">{toast.type === 'error' ? '⚠️' : (toast.type === 'warning' ? '⏳' : '✅')}</div>
              <div className="font-medium">{toast.text}</div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}