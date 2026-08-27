import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaUser, FaArrowLeft, FaCamera, FaSave, FaCheck, FaHeartbeat, 
  FaPhoneAlt, FaBullseye, FaFire, FaTrophy, FaMedal, FaMapMarkerAlt, 
  FaClock, FaSmile, FaBell, FaShieldAlt
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Ideally, useAuth should expose a method to refreshUser()
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Image Handling States
  const fileInputRef = useRef(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Profile Data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    focus: "General Wellness",
    emergencyName: "",
    emergencyPhone: "",
    reminderPreference: "none",
    joinedDate: "",
    profileImage: ""
  });

  // Stats
  const [stats] = useState({
    currentStreak: user?.streak?.current || 0,
    longestStreak: user?.streak?.longest || 0,
    latestBadge: user?.streak?.badges?.length > 0 ? user.streak.badges[user.streak.badges.length - 1] : "Beginner",
    lastMood: "Calm", 
    nextCheckIn: "Tomorrow"
  });

  // ✅ LOAD DATA
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.fullName || "",
        email: user.email || "",
        bio: user.bio || "Taking it one day at a time. 🌱",
        location: user.location || "",
        focus: user.wellnessFocus || "General Wellness",
        emergencyName: user.emergencyName || "",
        emergencyPhone: user.emergencyPhone || "",
        reminderPreference: user.reminderPreference || "none",
        joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Dec 2025",
        profileImage: user.profileImage || ""
      });

      // ✅ Set Profile Image Preview (Backend URL)
      if (user.profileImage) {
        const serverUrl = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://nivana-1.onrender.com');
        const fullUrl = user.profileImage.startsWith('http') ? user.profileImage : `${serverUrl}${user.profileImage}`;
        setImagePreviewUrl(fullUrl);
      }
    }
  }, [user]);

  const update = (field, value) => {
    setProfile({ ...profile, [field]: value });
    setSaved(false);
  };

  // ✅ Trigger Hidden File Input
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  // ✅ Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Show local preview
      setSaved(false);
    }
  };

  // ✅ SAVE DATA
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', profile.name);
      formData.append('bio', profile.bio);
      formData.append('location', profile.location);
      formData.append('wellnessFocus', profile.focus);
      formData.append('emergencyName', profile.emergencyName);
      formData.append('emergencyPhone', profile.emergencyPhone);
      formData.append('reminderPreference', profile.reminderPreference);

      // Append image if selected
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await apiService.updateUserProfile(formData);

      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Update local preview with real server path if returned
        if (res.user.profileImage) {
           const serverUrl = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://nivana-1.onrender.com');
           setImagePreviewUrl(`${serverUrl}${res.user.profileImage}`);
        }
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans selection:bg-teal-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/dashboard')} className="p-3 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-teal-900 transition-all shadow-sm">
                <FaArrowLeft />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Wellness Profile</h1>
                <p className="text-stone-500 text-sm mt-1">Manage your identity, safety contacts, and recovery goals.</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl border border-orange-100"><FaFire /></div>
                <div><div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Current Streak</div><div className="text-xl font-bold text-stone-800">{stats.currentStreak} Days</div></div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-xl border border-teal-100"><FaTrophy /></div>
                <div><div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Longest Streak</div><div className="text-xl font-bold text-stone-800">{stats.longestStreak} Days</div></div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl border border-green-100"><FaMedal /></div>
                <div><div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Latest Badge</div><div className="text-xl font-bold text-stone-800">{stats.latestBadge}</div></div>
             </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden sticky top-8">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-green-100 via-teal-50 to-stone-100"></div>
              
              {/* ✅ AVATAR SECTION WITH CAMERA */}
              <div className="relative mb-3 mt-16 group">
                <div className="w-28 h-28 rounded-full bg-white border-[5px] border-white shadow-lg flex items-center justify-center text-4xl font-bold text-teal-700 overflow-hidden relative">
                   {imagePreviewUrl ? (
                     <img src={imagePreviewUrl} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-4xl font-bold text-teal-700">{profile.name ? profile.name.charAt(0).toUpperCase() : <FaUser className="text-stone-300" />}</div>
                   )}
                </div>
                {/* Camera Button */}
                <div onClick={handleCameraClick} className="absolute bottom-1 right-1 bg-teal-600 text-white p-2 rounded-full shadow-md text-xs border-2 border-white cursor-pointer hover:bg-teal-700 transition">
                  <FaCamera />
                </div>
                {/* Hidden File Input */}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display:'none'}} accept="image/*" />
              </div>

              <h2 className="text-2xl font-bold text-teal-900 mb-1">{profile.name}</h2>
              <p className="text-sm text-stone-500 mb-2 flex items-center gap-1 justify-center">
                 {profile.location && <FaMapMarkerAlt className="text-stone-300" />} {profile.location || "Add Location"}
              </p>
              
              <div className="mt-4 mb-6 px-4 py-3 bg-stone-50 rounded-xl border border-stone-100 w-full">
                 <p className="text-sm text-stone-600 italic font-medium">"{profile.bio}"</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100 uppercase tracking-wider"><FaBullseye /> {profile.focus}</div>
              </div>

              <div className="w-full mt-4 text-xs text-stone-400">Member since {profile.joinedDate}</div>
            </div>
          </motion.div>

          {/* RIGHT: Form */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <form onSubmit={save} className="bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-8">
              
              {/* Personal Details */}
              <div>
                <h3 className="text-lg font-bold text-teal-900 mb-5 flex items-center gap-2 pb-2 border-b border-stone-100"><FaUser className="text-teal-500" /> Personal Details</h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-700">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => update("name", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-700">Email (Read Only)</label>
                    <input type="email" value={profile.email} disabled className="w-full px-4 py-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-700">Location</label>
                    <input type="text" value={profile.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Mumbai" className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-700">Mantra (Bio)</label>
                    <input type="text" value={profile.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Short quote" className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Wellness Focus */}
              <div>
                <h3 className="text-lg font-bold text-teal-900 mb-5 flex items-center gap-2 pb-2 border-b border-stone-100"><FaHeartbeat className="text-green-500" /> Wellness Focus</h3>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-stone-700">Current Goal</label>
                    <select value={profile.focus} onChange={(e) => update("focus", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-500 outline-none">
                        <option>General Wellness</option>
                        <option>Reducing Anxiety</option>
                        <option>Better Sleep</option>
                        <option>Managing Stress</option>
                    </select>
                </div>
              </div>

              {/* Safety Net */}
              <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2"><FaShieldAlt className="text-rose-500" /> Safety Net</h3>
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-stone-700">Contact Name</label>
                        <input type="text" value={profile.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 outline-none" placeholder="e.g. Mom" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-stone-700">Phone Number</label>
                        <input type="tel" value={profile.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 outline-none" placeholder="+1 234..." />
                    </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 flex items-center justify-end gap-4 border-t border-stone-100">
                 {saved && <span className="text-sm font-bold text-green-600 flex items-center gap-1"><FaCheck /> Saved!</span>}
                 <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold shadow-lg transition-all disabled:opacity-70">
                    {loading ? 'Saving...' : <><FaSave /> Save Profile</>}
                 </button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}