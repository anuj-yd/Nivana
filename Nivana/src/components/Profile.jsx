import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "Sam",
    email: "sam.doe@example.com",
    reminderPreference: "weekly",
  });
  const [saved, setSaved] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".page-header", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".profile-section", {
        y: 25,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.1,
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const update = (field, value) => {
    setProfile({ ...profile, [field]: value });
    setSaved(false);
  };

  const save = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#F5EEDF] px-6 py-8 text-[#1A1A1A]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="page-header flex items-start justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-3 inline-flex items-center text-xs px-3 py-2 rounded-xl bg-[#0F766E]/10 border border-[#0F766E]/40 text-[#0F766E] hover:bg-[#0F766E]/20 transition"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#134E4A]">
              Your Profile
            </h1>
            <p className="text-sm md:text-base text-[#4F4F4F] mt-2 max-w-xl">
              Keep your basic details and reminder preferences up to date so
              Nivana can support you in a way that feels right.
            </p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-5">
          <div className="profile-section">
            <label className="block text-sm font-medium text-[#134E4A] mb-1">
              Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-[#E4DCCF] rounded-xl p-2 bg-white/80 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] text-sm outline-none"
              placeholder="Your name"
            />
          </div>

          <div className="profile-section">
            <label className="block text-sm font-medium text-[#134E4A] mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full border border-[#E4DCCF] rounded-xl p-2 bg-white/80 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] text-sm outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div className="profile-section">
            <label className="block text-sm font-medium text-[#134E4A] mb-1">
              Check-in reminders
            </label>
            <select
              value={profile.reminderPreference}
              onChange={(e) => update("reminderPreference", e.target.value)}
              className="w-full border border-[#E4DCCF] rounded-xl p-2 bg-white/80 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] text-sm outline-none"
            >
              <option value="none">No reminders</option>
              <option value="weekly">Weekly check-in</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly reflection</option>
            </select>
            <p className="text-[11px] text-[#7A7A7A] mt-1">
              In a real backend, this could control email or in-app reminders.
            </p>
          </div>

          <div className="profile-section bg-white/80 border border-[#E4DCCF] rounded-2xl p-4 text-xs text-[#4F4F4F]">
            <p className="font-semibold text-[#134E4A] mb-1">
              Your privacy matters
            </p>
            <p>
              This is a demo profile view. When connected to a backend, you
              could add options like deleting your account, exporting your
              data, or choosing what information is stored.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              type="submit"
              className="px-6 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#0F766E33] transition-transform hover:-translate-y-0.5"
            >
              Save Changes
            </button>
            {saved && (
              <span className="text-xs text-[#0F766E]">
                Profile updated (demo only) ✓
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
