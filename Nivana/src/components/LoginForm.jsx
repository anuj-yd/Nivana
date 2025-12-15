import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ Link Import kiya

const LoginForm = ({ email, password, setEmail, setPassword, onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-teal-700/70" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full px-12 py-3 rounded-2xl bg-[#F5E9DA] text-teal-800 placeholder-teal-600/60 border border-[#D8C3A5] focus:border-teal-600 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-teal-700/70" />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-12 py-3 rounded-2xl bg-[#F5E9DA] text-teal-800 placeholder-teal-600/60 border border-[#D8C3A5] focus:border-teal-600 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-3.5 text-teal-700/70 hover:text-teal-900"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* ✅ Forgot Password Link */}
      <div className="text-right">
        <Link 
          to="/forgot-password" 
          className="text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-lg shadow-md hover:opacity-90 transition-all disabled:opacity-60"
      >
        {loading ? "Please wait..." : "Sign In"}
      </button>
    </form>
  );
};

export default LoginForm;