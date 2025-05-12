import React, { useState } from "react";
import { Button, Checkbox, Typography } from "antd";
import { MinusOutlined, PlusOutlined, DeleteFilled, DeleteOutlined } from "@ant-design/icons";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";

const { Text } = Typography;

const CartList = ({
  cart,
  selectedIds,
  toggleSelected,
  increaseQuantity,
  decreaseQuantity,
  handleRemoveFromCart,
}) => {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 4;
  console.log("selectedIds", selectedIds);
  console.log("cart", cart);

  if (cart.length === 0) return null;

  const displayedItems = expanded ? cart : cart.slice(0, VISIBLE_COUNT);

  return (
    <>
      {displayedItems.map((item) => (
        <div
          key={item.product_id}
          style={{
            marginBottom: "5px",
            display: "flex",
            gap: "10px",
          }}
        >
          <Checkbox
            checked={selectedIds.includes(item.product_id)}
            onChange={() => toggleSelected(item.product_id)}
          />
          <Text strong style={{ fontSize: "16px", flex: 1 }}>
            {item.name} = {item.price * item.quantity} ₽
          </Text>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              disabled={item.quantity <= 1}
              shape="circle"
              icon={<MinusOutlined />}
              onClick={() => decreaseQuantity(item.product_id)}
              size="small"
            />
            <Text style={{ margin: "0 8px" }}>{item.quantity}</Text>
            <Button
              disabled={item.quantity >= 10}
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => increaseQuantity(item.product_id)}
              size="small"
            />
          </div>
          <div
            onClick={() => handleRemoveFromCart(item.product_id)}
            style={{
              backgroundColor: "#fff5f5", // светло-розовый
              borderRadius: "8px", // скругление углов
              padding: "4px", // внутренний отступ
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              width: "24px",
              height: "24px",
            }}
          >
            <DeleteOutlined
              style={{
                color: "#f44336", // насыщенно-красный
                // fontSize: "20px",
              }}
            />
          </div>
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

export default observer(CartList);
