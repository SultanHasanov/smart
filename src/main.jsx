import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Route, Routes } from "react-router-dom"; // Используй Routes вместо Route
import App from "./App";
import CartPage from "./pages/CartPage";
import TabIcons from "./component/TabIcons";
import Favorites from "./pages/Favorites";
import Catalog from "./pages/Catalog";
import Header from "./component/Header";
import "./index.css";
import Login from "./pages/Admin";
import ProtectedRoute from "./component/ProtectedRoute";
import { AuthProvider } from "./store/AuthContext";

import { registerSW } from "virtual:pwa-register";
registerSW({
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <TabIcons />
    </AuthProvider>
  </Router>
);
