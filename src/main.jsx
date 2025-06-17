import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter  as Router, Route, Routes } from "react-router-dom"; // Используй Routes вместо Route
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
import SingleOrder from "./component/SingleOrder";
import UserOrders from "./pages/UserOrders";
import CategoryPage from "./pages/CategoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReviewsPage from "./pages/ReviewsPage";
import OrderManager from "./pages/OrderManager";
registerSW({
  immediate: true,
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceworker.js')
    .then(reg => console.log('SW зарегистрирован', reg))
    .catch(err => console.error('Ошибка регистрации SW', err));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/admin-orders" element={ <OrderManager/>} />
      <Route path="*" element={<NotFoundPage />} />

        <Route path="/orders" element={<UserOrders />} />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/catalog" element={<Catalog />} /> */}
        <Route path="/login" element={<Login />} />
         <Route path="/orders/:orderId" element={<SingleOrder />} />
      </Routes>
      <TabIcons />
    </AuthProvider>
  </Router>
);
