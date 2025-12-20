// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  // Default true rakha hai taki reload hote hi loading state me rahe
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load: Check LocalStorage & URL Params (OAuth)
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        const tokenFromStorage = localStorage.getItem('token');

        // Priority: URL Token (Fresh Login) > Storage Token
        if (tokenFromUrl) {
          localStorage.setItem('token', tokenFromUrl);
          setToken(tokenFromUrl);

          // URL clean karo (token hatao)
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          window.history.replaceState({}, document.title, url.pathname + url.search);
        
        } else if (tokenFromStorage) {
          setToken(tokenFromStorage);
        } else {
          // Agar koi token nahi mila, tabhi loading band karo
          setIsLoading(false);
        }
      } catch (e) {
        console.warn('Error reading token:', e);
        setToken(null);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 2. Login Function
  const login = (newToken, newUser = null) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    if (newUser) setUser(newUser);
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login'; 
  };

  // 4. User Fetch Effect (Handles Data Fetching & Loading State)
  useEffect(() => {
    const fetchUser = async () => {
      // Agar token null hai, toh kuch fetch mat karo
      if (!token) {
        // Agar pehle se loading true thi (initial load), toh ab false kardo
        setIsLoading(false);
        return;
      }

      try {
        // ✅ Loading ON rakho jab tak data na aaye
        setIsLoading(true);

        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Token invalid or expired');
        }

        const data = await res.json();
        
        // Backend se user data set karo
        setUser(data.user || data); // Adjust based on backend response structure

      } catch (e) {
        console.warn('Authentication failed, auto-logging out:', e);
        
        // Agar token expire ho gaya, to clean up karo
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        // ✅ Data aane ke baad hi Loading band karo
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated: !!token, 
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;