import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Route, Routes } from "react-router-dom";  // Используй Routes вместо Route
import App from "./App";
import Admin from "./pages/Admin";
import CartPage from "./pages/CartPage";
import TabIcons from "./component/TabIcons";
import Favorites from "./pages/Favorites";
import Catalog from "./pages/Catalog";
import Header from "./component/Header";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>  {/* Используй только HashRouter */}
    <Header />
    <Routes>  {/* Заменяй Route на Routes */}
      <Route path="/" element={<App />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/login" element={<Admin />} />
    </Routes>
    <TabIcons />
  </Router>
);
