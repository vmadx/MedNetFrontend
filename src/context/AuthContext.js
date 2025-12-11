import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get API URLs from environment variables
  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const MODEL_API_URL = process.env.REACT_APP_MODEL_API_URL || "http://localhost:8000";

  // Check if user is logged in when the app starts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We use fetch with credentials: 'include' so the browser sends the session cookie
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Crucial for sending the session cookie
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [API_URL]);

  // Logout function that calls the backend's session clear endpoint
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, API_URL, MODEL_API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);