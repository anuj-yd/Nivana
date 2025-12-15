import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const { token } = useParams(); // URL se token nikalne ke liye
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Link expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-[#E6D5C3]">
        <h2 className="text-3xl font-bold text-teal-800 mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-8">Enter your new password below.</p>

        {message && <div className="p-3 bg-green-100 text-green-700 rounded-lg mb-4">{message}</div>}
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-teal-700/70" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
              className="w-full px-12 py-3 rounded-2xl bg-[#F5E9DA] text-teal-800 border border-[#D8C3A5] focus:border-teal-600 outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-teal-700">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-teal-700/70" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              className="w-full px-12 py-3 rounded-2xl bg-[#F5E9DA] text-teal-800 border border-[#D8C3A5] focus:border-teal-600 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-semibold text-lg shadow-md hover:bg-teal-700 transition-all disabled:opacity-60"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;