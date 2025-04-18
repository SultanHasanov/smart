import React, { useState } from "react";
import { Button, Checkbox, Typography } from "antd";
import { MinusOutlined, PlusOutlined, DeleteFilled } from "@ant-design/icons";

const { Text } = Typography;

const CartList = ({ cart, selectedIds, toggleSelected, increaseQuantity, decreaseQuantity, handleRemoveFromCart }) => {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 4;

  if (cart.length === 0) return null;

  const displayedItems = expanded ? cart : cart.slice(0, VISIBLE_COUNT);

  return (
    <>
      {displayedItems.map((item) => (
        <div
          key={item.id}
          style={{
            marginBottom: "5px",
            display: "flex",
            gap: "10px",
          }}
        >
          <Checkbox
            checked={selectedIds.includes(item.id)}
            onChange={() => toggleSelected(item.id)}
          />
          <Text strong style={{ fontSize: "16px", flex: 1 }}>
            {item.name} = {item.price * item.quantity} ₽
          </Text>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              shape="circle"
              icon={<MinusOutlined />}
              onClick={() => decreaseQuantity(item.id)}
              size="small"
            />
            <Text style={{ margin: "0 8px" }}>{item.quantity}</Text>
            <Button
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => increaseQuantity(item.id)}
              size="small"
            />
          </div>
          <DeleteFilled
            onClick={() => handleRemoveFromCart(item.id)}
            style={{
              color: "#f44336",
              cursor: "pointer",
              fontSize: "20px",
            }}
          />
        </div>
      ))}

      {cart.length > VISIBLE_COUNT && (
        <Button
          type="link"
          onClick={() => setExpanded(!expanded)}
          style={{ paddingLeft: 0 }}
        >
          {expanded ? "Скрыть" : `Показать ещё ${cart.length - VISIBLE_COUNT}`}
        </Button>
      )}
    </>
  );
};

export default CartList;
