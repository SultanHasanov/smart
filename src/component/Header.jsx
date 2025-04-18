import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MenuOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

// Вызов пасхалки (кот-терминал)
const openHackerCatTerminal = () => {
  const event = new CustomEvent('hackerCatOpen');
  window.dispatchEvent(event);
};

const Header = ({ subtitle = "Быстрая доставка за 30 мин" }) => {
  const navigate = useNavigate();
  const timeout = useRef(null);


  const handleTouchStart = () => {
    timeout.current = setTimeout(() => {
      openHackerCatTerminal(); // активирует кота
    }, 3000); // Удержание 3 секунды
  };

  const handleTouchEnd = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 100 }}>
      {/* Верхняя панель */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px 8px",
        }}
      >
        {/* Меню или кнопка назад */}
        <MenuOutlined
          style={{ fontSize: "22px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        />

        {/* Название с пасхалкой */}
        <div
          style={{ fontSize: "20px", fontWeight: "700", color: "red", cursor: "pointer", userSelect: "none" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          Smart
        </div>

        {/* Корзина */}
        <ShoppingCartOutlined
          onClick={() => navigate("/cart")}
          style={{ fontSize: "22px", cursor: "pointer" }}
        />
      </div>

      {/* Подзаголовок или статус */}
      <div style={{ padding: "0 16px 10px", fontSize: "14px", color: "#888" }}>
        {subtitle}
      </div>
    </div>
  );
};

export default Header;
