import { jwtDecode } from "jwt-decode";
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [userRole, setUserRole] = useState(null); // 👈 добавлено

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      try {
        const decoded = jwtDecode(currentToken);
        setUserRole(decoded.role || null); // 👈 достаём роль
        setToken(currentToken);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Ошибка декодирования токена:", err);
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }

    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem("token");
      if (updatedToken) {
        try {
          const decoded = jwtDecode(updatedToken);
          setUserRole(decoded.role || null);
          setToken(updatedToken);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Ошибка декодирования при storage:", err);
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      setUserRole(decoded.role || null);
    } catch (err) {
      console.error("Ошибка декодирования при логине:", err);
    }

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        userRole, // 👈 экспортируем роль
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
