import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

// Base API URL (you can change this)
const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Run when app loads
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const data = await response.json();

      setUser(data);
      setIsAuthenticated(true);

    } catch (error) {
      console.error("Auth check failed:", error);

      setUser(null);
      setIsAuthenticated(false);
      setAuthError(error.message);

      localStorage.removeItem("token"); // remove invalid token
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuthenticated(true);

    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);

    // Optional redirect
    window.location.href = "/login";
  };

  // Redirect to login page
  const goToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        login,
        logout,
        goToLogin,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
