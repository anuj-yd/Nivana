// src/components/Auth.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chrome, Github } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

// Vanta + Three (optional)
import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min';

// const API_BASE_URL = 'http://localhost:5000';
// Agar Vercel par environment variable hai to wo use karega, nahi to Render ka link
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nivana.onrender.com';

// Typewriter Component
const Typewriter = ({ text, speed = 100, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout;
    let charIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    const typeChar = () => {
      if (charIndex < text.length) {
        setDisplayText(text.slice(0, charIndex + 1));
        charIndex++;
        timeout = setTimeout(typeChar, speed);
      } else {
        setIsTyping(false);
      }
    };

    const startTimeout = setTimeout(() => {
      typeChar();
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearTimeout(startTimeout);
    };
  }, [text, speed, delay]);

  return (
    <span className="inline-block text-teal-800">
      {displayText.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < displayText.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
      <span
        className={`inline-block w-[3px] h-[1em] bg-teal-600 ml-1 align-middle ${isTyping ? 'animate-pulse' : 'opacity-0'}`}
      />
    </span>
  );
};

const NivanaAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔐 OAUTH TOKEN CAPTURE
  const auth = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      auth.login(token);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, auth]);

  // initial mode from pathname
  const [isLogin, setIsLogin] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.location.pathname.includes('signup');
    }
    return true;
  });

  useEffect(() => {
    setIsLogin(!location.pathname.includes('signup'));
  }, [location.pathname]);

  const [isAnimating, setIsAnimating] = useState(false);

  // Forms state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Vanta
  const vantaRef = useRef(null);
  const vantaEffectRef = useRef(null);

  useEffect(() => {
    if (!vantaEffectRef.current && vantaRef.current) {
      try {
        vantaEffectRef.current = CLOUDS({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          skyColor: 0x68b8d7,
          backgroundColor: 0xadc1de,
          cloudColor: 0xffffff,
          cloudShadowColor: 0x183550,
          sunColor: 0xff6633,
          sunGlareColor: 0xff9919,
          sunlightColor: 0xff9933,
        });
      } catch (e) { }
    }

    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };
  }, []);

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 🔥 YAHAN CHANGE KIYA HAI: CLEAR INPUTS ON TOGGLE 🔥
  const toggleAuthMode = () => {
    setIsAnimating(true);
    resetMessages();

    // ✨ Switch karte hi purana data clear kar do
    setFullName('');
    setEmail('');
    setPassword('');

    setTimeout(() => {
      const nextIsLogin = !isLogin;
      setIsLogin(nextIsLogin);
      setIsAnimating(false);

      try {
        if (nextIsLogin) {
          navigate('/login', { replace: true });
        } else {
          navigate('/signup', { replace: true });
        }
      } catch (e) { }
    }, 400);
  };

  const handleSocialLogin = (provider) => {
    let url = '';

    switch (provider) {
      case 'google':
        url = `${API_BASE_URL}/auth/google`;
        break;
      case 'github':
        url = `${API_BASE_URL}/auth/github`;
        break;
      default:
        return;
    }

    window.location.href = url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    // 1. Basic Empty Fields Check
    if (!email.trim() || !password) {
        setErrorMsg('Please fill in all required fields.');
        return;
    }

    // 2. Signup Specific Validation
    if (!isLogin) {
        if (!fullName.trim()) {
            setErrorMsg('Full Name is required for signup.');
            return;
        }

        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(fullName)) {
            setErrorMsg('Name must contain only letters and spaces (no numbers or symbols).');
            return;
        }
    }

    // 3. Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address.');
        return;
    }

    // 4. Password Strength Validation
    if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);

    try {
      const url = isLogin
        ? `${API_BASE_URL}/api/auth/login`
        : `${API_BASE_URL}/api/auth/signup`;

      const body = isLogin ? { email, password } : { fullName, email, password };

      const res = await axios.post(
        url,
        body,
        { withCredentials: true }
      );

      const data = res.data;

      if (!data || !data.token) {
        throw new Error("Token missing in auth response");
      }

      auth.login(data.token, data.user);

      // Login/Signup success hone par bhi data clear karein
      setFullName('');
      setEmail('');
      setPassword('');

      setSuccessMsg(isLogin ? 'Logged in successfully ✨' : 'Account created successfully ✨');

      navigate("/dashboard", { replace: true });

    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        'Something went wrong';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const goToAbout = () => {
    navigate('/');
  };

  return (
    <div
      ref={vantaRef}
      className="min-h-screen w-full overflow-hidden flex items-center justify-center relative font-sans text-teal-900"
    >
      <style>{`
        @keyframes draw-border {
          0% { opacity: 0; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }

        .self-draw-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.6rem;
          pointer-events: none;
          border: 2px solid rgba(216, 195, 165, 0.95);
          animation: draw-border 1.4s ease forwards;
        }
      `}</style>

      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,#f5e0c8_0,#f5e9da_40%,#f8f3e8_75%,#fdf8f1_100%)] mix-blend-soft-light pointer-events-none" />

      <div className="self-draw-card relative z-10 w-full max-w-[1050px] min-h-[650px] flex flex-col md:flex-row m-4 rounded-3xl overflow-hidden border border-[#D8C3A5]/90 shadow-[0_28px_70px_rgba(36,115,108,0.35)] backdrop-blur-2xl bg-[#F5E9DA]/95">

        {/* Left Section */}
        <div className="w-full md:w-5/12 p-10 md:p-14 flex flex-col justify-between relative overflow-hidden rounded-3xl md:rounded-none md:rounded-l-3xl border-r border-[#D8C3A5]/80 bg-linear-to-br from-[#F3DFC9] via-[#F5E9DA] to-[#F8F3E8]">

          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-full  bg-[#FDF8F1] backdrop-blur-md border border-[#D8C3A5] flex items-center justify-center shadow-md shadow-[#D8C3A5]/70">
              <img src="/Logo.jpg"
                alt="Nivana Logo"
                className="w-10 h-10 rounded-full shadow-md"
              />
            </div>
            <span className="text-2xl font-serif font-bold tracking-wide text-teal-900">
              NIVANA
            </span>
          </div>

          <div className="relative z-10 mt-16 md:mt-0 min-h-40">
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-[1.15] mb-6 bg-clip-text text-transparent bg-linear-to-br from-teal-800 via-teal-700 to-teal-500">
              <Typewriter
                key={isLogin ? 'login-head' : 'signup-head'}
                text={isLogin ? 'Find your\ninner calm.' : 'Begin your\njourney.'}
                speed={70}
                delay={200}
              />
            </h2>
            <p className="text-teal-800/80 text-base md:text-lg font-medium leading-relaxed">
              {isLogin
                ? 'Welcome back to your sanctuary. A space designed for clarity, balance, and growth.'
                : 'Join a community dedicated to mental wellness. Create space for yourself today.'}
            </p>
          </div>

          <div className="relative z-10 mt-8 text-xs font-bold tracking-widest uppercase text-teal-800/70">
            <button
              onClick={goToAbout}
              className="cursor-pointer inline-flex items-center gap-1 group text-left bg-transparent border-none p-0"
            >
              <span className="group-hover:text-teal-700 transition-colors">About Us</span>
              <span className="h-px w-8 bg-linear-to-r from-teal-400 via-teal-500 to-teal-700 group-hover:w-10 transition-all ml-2" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-7/12 p-8 md:p-16 bg-[#F8F3E8]/90 flex flex-col justify-center relative">

          <div className="absolute top-8 right-8 md:top-10 md:right-10 z-20">
            <button
              onClick={toggleAuthMode}
              disabled={isAnimating || loading}
              className="text-sm text-teal-900 font-semibold flex items-center gap-2 group px-4 py-2 rounded-full border border-[#D8C3A5]/80 bg-[#F5E9DA]/90 hover:bg-[#EBDCC8] hover:border-teal-600 hover:text-teal-700 transition-all disabled:opacity-50"
            >
              {isLogin ? 'Not a member?' : 'Already a member?'}
              <span className="text-teal-700 underline decoration-teal-300 underline-offset-4 group-hover:decoration-teal-600">
                {isLogin ? 'Join now' : 'Sign In'}
              </span>
            </button>
          </div>

          <div className={`max-w-md mx-auto w-full transition-all duration-700 ${isAnimating ? 'opacity-0 translate-y-8 blur-md scale-95' : 'opacity-100 translate-y-0 blur-0 scale-100'}`}>
            <h3 className="text-2xl font-serif font-bold text-teal-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-teal-800/80 font-medium text-sm mb-4">
              {isLogin ? 'Please enter your details.' : 'It only takes a minute to start.'}
            </p>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-4 text-sm text-[#7f2a2a] bg-[#f8d6d3] border border-[#e3a6a1] rounded-lg px-3 py-2">
                {errorMsg}
              </div>
            )}
            
            {/* Success Message Box */}
            {successMsg && (
              <div className="mb-4 text-sm text-teal-900 bg-[#d8f2e3] border border-[#9fd6b5] rounded-lg px-3 py-2">
                {successMsg}
              </div>
            )}

            {isLogin ? (
              <LoginForm
                email={email}
                password={password}
                setEmail={setEmail}
                setPassword={setPassword}
                onSubmit={handleSubmit}
                loading={loading}
              />
            ) : (
              <SignupForm
                fullName={fullName}
                email={email}
                password={password}
                setFullName={setFullName}
                setEmail={setEmail}
                setPassword={setPassword}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}

            {/* ----- SOCIAL ICONS: RENDER ONLY IF LOGIN ----- */}
            {isLogin && (
              <>
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D8C3A5]/90" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="px-4 bg-[#F8F3E8] text-teal-800/80 font-semibold">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    className="p-3 bg-[#F5E9DA] hover:bg-[#EBDCC8] rounded-full transition-all duration-300 shadow-sm border border-[#D8C3A5] hover:border-teal-600 hover:shadow-md hover:shadow-teal-200/70"
                  >
                    <Chrome className="w-5 h-5 text-inherit" />
                  </button>

                  <button
                    onClick={() => handleSocialLogin('github')}
                    className="p-3 bg-[#F5E9DA] hover:bg-[#EBDCC8] rounded-full transition-all duration-300 shadow-sm border border-[#D8C3A5] hover:border-teal-600 hover:shadow-md hover:shadow-teal-200/70"
                  >
                    <Github className="w-5 h-5 text-black" />
                  </button>
                </div>
              </>
            )}
            {/* ---------------------------------------------- */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default NivanaAuth;