import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import CartPage from "./pages/CartPage";
import TabIcons from "./component/TabIcons";
import Favorites from "./pages/Favorites";
import Header from "./component/Header";
import "./index.css";
import Login from "./pages/Admin";
import ProtectedRoute from "./component/ProtectedRoute";
import { AuthContext, AuthProvider } from "./store/AuthContext";

import SingleOrder from "./component/SingleOrder";
import UserOrders from "./pages/UserOrders";
import CategoryPage from "./pages/CategoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReviewsPage from "./pages/ReviewsPage";
import OrderManager from "./pages/OrderManager";
import PWAInstallGuide from "./pages/PWAInstallGuide";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceworker.js")
      .then(function (reg) {
        subscribeUserToPush(); // 👈 подписываемся сразу после
      })
      .catch(function (err) {
      });
  });
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
        <Route path="/admin-orders" element={<OrderManager />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/info" element={<PWAInstallGuide />} />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/orders/:orderId" element={<SingleOrder />} />
      </Routes>
      <TabIcons />
    </AuthProvider>
  </Router>
);
