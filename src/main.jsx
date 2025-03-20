import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Admin from "./pages/Admin";
import Product from "./pages/Product";
import { TimeProvider } from "./TimeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <TimeProvider>

  
    <Routes>
      <Route path="/booking" element={<App />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<Product/>} />
    </Routes>
    </TimeProvider>
  </BrowserRouter>
);
