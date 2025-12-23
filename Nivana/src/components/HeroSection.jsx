import React from "react";
import { motion } from "framer-motion";
import "./LandingPage2.css"; // Ensure CSS is imported
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  const goToLogin = () => navigate("/login");
  const goToSignup = () => navigate("/signup");

  return (
    <header id="home" className="home pt-36 relative">
      <div className="max-w-6xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-20">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          {/* pill */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-linear-to-r from-[#e8f7ef] to-[#efe9fb] border border-[#d9f0e5] text-sm text-[#1f6b50] mb-10">
            <span>🌸</span>
            <span className="font-medium">
              Your gentle companion for wellness
            </span>
          </div>

          {/* heading - ADDED 'tracking-in-expand' HERE */}
          <h1 className="font-display text-[56px] md:text-[64px] leading-[1.05] font-semibold text-[#143f2b] tracking-in-expand">
            You <span className="text-[#3fbf8e] font-bold">Deserve</span> to <br />
            Feel{" "}
            <span className="relative text-[#3fbf8e] font-bold">
              Joy
              <span className="absolute -top-3 -right-5 text-lg animate-bounce-gentle">✨</span>
            </span>
          </h1>

          {/* description */}
          <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-[#4a6f5c]">
            Guided self-assessments, calming activities, and gentle guidance —
            all in a safe, private space designed to help you bloom into your best self.
          </p>

          {/* buttons */}
          <div className="mt-12 flex flex-wrap gap-4">
            <button onClick={goToSignup} className="px-8 py-4 rounded-full bg-[#34cfa1] text-white font-medium shadow-sm">
              Start Your Journey 🌱
            </button>

            <a
              href="#services"
              className="px-8 py-4 rounded-full border border-[#cceee2] bg-white text-[#1f6b50] font-medium"
            >
              Explore Features 🦋
            </a>
          </div>
        </motion.div>

        {/* RIGHT VIDEO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          className="flex-1 flex justify-center z-1"
        >
          <div className="relative w-full max-w-[480px]">

            {/* 🦋 TOP RIGHT BUTTERFLY — OUTSIDE CARD */}
            <div className="absolute -top-6 -right-6 text-2xl animate-wiggle z-20">
              🦋
            </div>

            {/* 🌸 BOTTOM LEFT FLOWER — OUTSIDE CARD */}
            <div className="absolute -bottom-5 -left-5 text-xl animate-sway z-20">
              🌸
            </div>

            {/* CARD */}
            <div className="bg-[#fffdf7] rounded-[28px] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.08)] overflow-hidden">

              {/* VIDEO */}
              <motion.video
                src="/hero-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                initial={{
                  scale: 1.25,
                  borderRadius: "32px",
                }}
                animate={{
                  scale: 1,
                  borderRadius: "22px",
                }}
                transition={{
                  duration: 1.1,
                  ease: [0.22, 1, 0.36, 1], // very smooth ease
                }}
                className="w-full h-[360px] object-cover"
              />

              {/* SOFT OVERLAY */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.0) 45%, rgba(255,255,255,0.35) 100%)",
                }}
              />
            </div>
          </div>
        </motion.div>

      </div>
    </header>
  );
}