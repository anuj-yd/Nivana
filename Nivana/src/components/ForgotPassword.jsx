import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 👇 Ye logic khud decide karega ki Localhost chalana hai ya Render
  const backendURL = import.meta.env.MODE === "development" 
    ? "http://localhost:5000" 
    : "https://nivana.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // 👇 Yahan ab dynamic URL use ho raha hai
      const res = await axios.post(`${backendURL}/api/auth/forgot-password`, { email });
      setMessage("Check your email for the reset link!");
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-[#E6D5C3]">
        <Link to="/login" className="flex items-center text-teal-600 mb-6 hover:underline">
          <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Link>

        <h2 className="text-3xl font-bold text-teal-800 mb-2">Forgot Password</h2>
        <p className="text-gray-600 mb-8">Enter your email to receive a reset link.</p>

        {message && <div className="p-3 bg-green-100 text-green-700 rounded-lg mb-4">{message}</div>}
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-teal-700/70" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-12 py-3 rounded-2xl bg-[#F5E9DA] text-teal-800 border border-[#D8C3A5] focus:border-teal-600 focus:ring-2 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-semibold text-lg shadow-md hover:bg-teal-700 transition-all disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;