import React from "react";
import "./LandingPage2.css";
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const goToLogin = () => navigate("/login");
  const goToSignup = () => navigate("/signup");
  return (
    <nav className="fixed top-5 left-0 right-0 z-40">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* MAIN NAV CONTAINER */}
        <div
          className="
            flex items-center justify-between
            rounded-full
            px-7 py-3
            backdrop-blur-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.08)]
            bg-gradient-to-r
            
          "
        >
          {/* LOGO */}
          <div className="flex items-center gap-3">
            {/* <div
              className="
                w-11 h-11 rounded-2xl
                bg-gradient-to-br from-[#4cd964] to-[#34cfa1]
                flex items-center justify-center
                text-xl
                shadow-md
              "
            >🌿</div> */}
            <img src="/Logo.jpg"
              alt="Nivana Logo"
              className="w-10 h-10 rounded-2xl shadow-md"
            />

            <div className="leading-tight">
              <div className="font-display font-semibold text-lg text-[#163020]">
                Nivana
              </div>
              <div className="text-xs text-[#163020]/70">
                Your Mind Speaks Nivana Listens
              </div>
            </div>
          </div>

          {/* LINKS */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {["Home", "About", "Services", "Journey", "Community"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="
                  text-[#355f4b]
                  hover:text-[#34cfa1]
                  transition-colors duration-300
                "
              >
                {item}
              </a>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="flex items-center gap-3">
            {/* LOG IN */}
            <button onClick={goToLogin}
              className="
                px-5 py-2.5
                rounded-full
                bg-[#f4fbf7]
                text-[#355f4b]
                border border-[#d7efe4]
                font-medium text-sm
                hover:bg-[#e9f7f0]
                transition
              "
            >
              Log in
            </button>

            {/* GET STARTED */}
            <button onClick={goToSignup}
              className="
                px-6 py-2.5
                rounded-full
                bg-gradient-to-r from-[#5edc84] to-[#34cfa1]
                text-white
                font-semibold text-sm
                shadow-md
                hover:scale-105
                transition
              "
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
