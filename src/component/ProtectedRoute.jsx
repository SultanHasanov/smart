// ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { message } from "antd";
import { AuthContext } from "../store/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    message.warning("Пожалуйста, войдите в систему, чтобы получить доступ.");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
