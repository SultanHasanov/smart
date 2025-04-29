// component/OrderButtonOverlay.jsx
import { observer } from "mobx-react-lite";
import { Button } from "antd";
import UIStore from "../store/UIStore";
import { useState } from "react";

const OrderButtonOverlay = observer(() => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  if (!UIStore.showGlobalOrderButton || !UIStore.onClickOrder) return null;

  const calculateTotal = () => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return new Intl.NumberFormat("ru-RU").format(total);
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 70, // выше табов
        left: 0,
        right: 0,
        padding: "0 16px",
        zIndex: 999,
      }}
    >
      <Button
        type="primary"
        size="large"
        block
        style={{
          height: 50,
          fontSize: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
        onClick={UIStore.onClickOrder}
      >
        <div>{cart.reduce((acc, item) => acc + item.quantity, 0)} товаров</div>
        <div>Оформить</div>
        <div>{calculateTotal()} ₽</div>
      </Button>
    </div>
  );
});

export default OrderButtonOverlay;
