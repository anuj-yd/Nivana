import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; 

import LandingPage from "./components/LandingPage";
import NivanaAuth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Assessment from "./components/Assessment";
import Profile from "./components/Profile";
import Guidance from "./components/Guidance";
import History from "./components/History";
import GlobalLayout from "./components/GlobalLayout";
import PrivateJournaling from "./components/PrivateJournaling";
import GuidedMeditation from "./components/GuidedMeditation";
import SoundScape from "./components/SoundScape";
import LaughterTherapy from "./components/LaughterTherapy";


// ✅ 1. Naye Components Import Karein
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <Routes>
        
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<NivanaAuth />} />
        <Route path="/signup" element={<NivanaAuth />} />
        <Route path="/auth" element={<NivanaAuth />} />

        {/* ✅ 2. New Routes for Password Reset */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<GlobalLayout />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/assessments" element={<Assessment />} />
           <Route path="/guidance" element={<Guidance />} />
           <Route path="/history" element={<History />} />
           <Route path="/profile" element={<Profile />} />
           <Route path="/journal" element={<PrivateJournaling />} />
           <Route path="/meditation" element={<GuidedMeditation />} />
           <Route path="/sounds" element={<SoundScape />} />
           <Route path="/laughter" element={<LaughterTherapy />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;