import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Admin from "./pages/Admin";
import Product from "./component/Product";
import CartPage from "./pages/CartPage";
import TabIcons from "./component/TabIcons";
import AppBottomTabs from "./component/TabIcons";
import Favorites from "./pages/Favorites";
import Catalog from "./pages/Catalog";
import Header from "./component/Header";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Header />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/login" element={<Admin />} />
    </Routes>
    <TabIcons />
  </BrowserRouter>
);
