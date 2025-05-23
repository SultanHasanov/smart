import { jwtDecode } from "jwt-decode";
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [userRole, setUserRole] = useState(null);
   const [userId, setUserId] = useState(null); // 👈 ДОБАВЛЕН userId

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (currentToken) {
      try {
        const decoded = jwtDecode(currentToken);
        console.log("Decoded JWT:", decoded);
        setUserRole(decoded.role || null);
         setUserId(decoded.user_id || null); // 👈 ДОСТАЛ user_id
        setToken(currentToken);
        setUsername(storedUsername || null);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Ошибка декодирования токена:", err);
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
        setUserId(null); // 👈 обнуляем
      setUsername(null);
    }

    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem("token");
      const updatedUsername = localStorage.getItem("username");

      if (updatedToken) {
        try {
          const decoded = jwtDecode(updatedToken);
          console.log(decoded)
          setUserRole(decoded.role || null);
            setUserId(decoded.user_id || null); // 👈
          setToken(updatedToken);
          setUsername(updatedUsername || null);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Ошибка декодирования при storage:", err);
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
          setUserId(null); // 👈
        setUsername(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (newToken, newUsername) => {
    try {
      const decoded = jwtDecode(newToken);
      console.log("Decoded JWT:", decoded);
      setUserRole(decoded.role || null);
        setUserId(decoded.user_id || null); // 👈
    } catch (err) {
      console.error("Ошибка декодирования при логине:", err);
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
     setUserId(null); // 👈
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,        // 👈 экспортируем имя
        userId, 
        isAuthenticated,
        userRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
