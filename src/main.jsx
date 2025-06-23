import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Используй Routes вместо Route
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

import SingleOrder from "./component/SingleOrder";
import UserOrders from "./pages/UserOrders";
import CategoryPage from "./pages/CategoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReviewsPage from "./pages/ReviewsPage";
import OrderManager from "./pages/OrderManager";
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

window.addEventListener("load", async () => {
  try {
    const reg = await navigator.serviceWorker.register("/serviceworker.js");
    console.log("✅ Service Worker зарегистрирован:", reg);

    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BNzjcHZGKpcIGvMLbuAxxLx7nDDduh17XkP37wB3gW-mShK-rinrnTHA3MCbS3_kaGM7gWguuzBA9nizvQKB-70"
        ),
      });
      console.log("📬 Подписка получена:", newSub);

      // TODO: отправь newSub на сервер
    } else {
      console.log("📬 Уже подписан:", subscription);
    }
  } catch (err) {
    console.error("❌ Ошибка регистрации Service Worker:", err);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/admin-orders" element={<OrderManager />} />
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
