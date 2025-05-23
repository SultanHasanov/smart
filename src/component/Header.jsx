import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MenuOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import CartStore from "../store/CartStore";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";

// Вызов пасхалки (кот-терминал)
const openHackerCatTerminal = () => {
  const event = new CustomEvent("hackerCatOpen");
  window.dispatchEvent(event);
};

const Header = ({ subtitle = "Быстрая доставка за 30 мин" }) => {
  const cart = CartStore.cart;
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
    <div
      style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
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
        {/* <MenuOutlined
          style={{ fontSize: "22px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        /> */}

        {/* Название с пасхалкой */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "red",
            cursor: "pointer",
            userSelect: "none",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => navigate("/")}
        >
          Smart
        </div>

        {/* Корзина */}
        <div style={{ display: "flex", flexDirection: "column",  alignItems: "center" }}>
          <ShoppingCartOutlined
            onClick={() => navigate("/cart")}
            style={{ fontSize: "22px", cursor: "pointer" }}
          />
          <span style={{ color: "#1677ff", fontSize: 12, fontWeight: "bold" }}>
            {new Intl.NumberFormat("ru-RU").format(CartStore.totalPrice)} ₽
          </span>
        </div>
      </div>

      {/* Подзаголовок или статус */}
      <div style={{ padding: "0 16px 10px", fontSize: "14px", color: "#888" }}>
        {subtitle}
      </div>
    </div>
  );
};

export default observer(Header);
