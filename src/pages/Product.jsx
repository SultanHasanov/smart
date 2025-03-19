import { Button, Typography } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { DeleteFilled, MinusOutlined, PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Example dishes
const dishes = [
  { id: 1, name: "Пицца", price: 500, emoji: "🍕" },
  { id: 2, name: "Суши", price: 300, emoji: "🍣" },
  { id: 3, name: "Бургер", price: 350, emoji: "🍔" },
  { id: 4, name: "Салат", price: 150, emoji: "🥗" },
  { id: 5, name: "Стейк", price: 700, emoji: "🥩" },
  { id: 6, name: "Десерт", price: 200, emoji: "🍰" },
];

const Product = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const navigate = useNavigate();

  const handleAddToCart = (dishId) => {
    const newCart = [...cart];
    const dishIndex = newCart.findIndex((item) => item.id === dishId);

    if (dishIndex > -1) {
      newCart[dishIndex].quantity += 1;
    } else {
      newCart.push({
        id: dishId,
        quantity: 1,
        name: dishes.find((dish) => dish.id === dishId).name,
        price: dishes.find((dish) => dish.id === dishId).price,
      });
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleDecreaseQuantity = (dishId) => {
    const newCart = [...cart];
    const dishIndex = newCart.findIndex((item) => item.id === dishId);

    if (dishIndex > -1 && newCart[dishIndex].quantity > 1) {
      newCart[dishIndex].quantity -= 1;
    } else {
      // Если количество товара меньше или равно 1, удаляем его из корзины
      newCart.splice(dishIndex, 1);
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleReserveTable = () => {
    navigate("/booking");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleRemoveFromCart = (dishId) => {
    const newCart = cart.filter((item) => item.id !== dishId); // Убираем элемент по id
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  return (
    <div style={{ padding: 10 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {dishes.map((dish) => {
          const currentDish = cart.find((item) => item.id === dish.id);
          const quantity = currentDish ? currentDish.quantity : 0;

          return (
            <div
              key={dish.id}
              style={{
                width: "117px",
                boxSizing: "border-box",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                position: "relative",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div onClick={() => handleAddToCart(dish.id)}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                  {dish.emoji}
                </div>
                <span>
                  <b style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {dish.name}
                  </b>
                </span>
                <div style={{ margin: "10px 0 10px" }}>
                  <b style={{ fontSize: "16px", fontWeight: "bold" }}>Цена:</b>{" "}
                  {dish.price} ₽
                </div>
              </div>
              <div className="btn-product">
                <button
                  onClick={() => handleDecreaseQuantity(dish.id)}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <MinusOutlined />
                </button>
                <button
                  onClick={() => handleAddToCart(dish.id)}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <PlusOutlined />
                </button>
              </div>
              {quantity > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    border: "0.3px solid black",
                    color: "green",
                    width: "20px",
                    textAlign: "center",
                    padding: "2px",
                    borderRadius: "50%",
                  }}
                >
                  <b>{quantity}</b>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "left", margin: "40px 0 10px 0" }}>
        {cart.length > 0 ? (
          cart.map((item) => (
            <div
              key={item.id}
              style={{ marginBottom: "5px", position: "relative" }}
            >
              <Text
                strong
                style={{
                  fontSize: "16px",
                  margin: 0,
                }}
              >
                {item.name} x{item.quantity} = {item.price * item.quantity} ₽
                <DeleteFilled
                  onClick={() => handleRemoveFromCart(item.id)}
                  style={{
                    position: "absolute",
                    right: "0", // Иконка будет располагаться справа
                    top: "50%", // По центру по вертикали
                    transform: "translateY(-50%)",
                    color: "#f44336",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                />
              </Text>
            </div>
          ))
        ) : (
          <Text>Корзина пуста</Text>
        )}

        <div style={{ marginTop: "10px" }}>
          <Text strong>Итоговая стоимость: {calculateTotal()} ₽</Text>
        </div>

        <Button
          size="large"
          onClick={handleReserveTable}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            width: "100%",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Забронировать столик
        </Button>
      </div>
    </div>
  );
};

export default Product;
