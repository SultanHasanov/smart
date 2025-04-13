import { Button, Typography, Input } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import {
  DeleteFilled,
  MinusOutlined,
  PlusOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import dishes from "../data";
import TabIcons from "./TabIcons";

const { Text } = Typography;

const categories = [
  { id: "1", name: "Блюда" },
  { id: "6", name: "Фастфуд" },
  { id: "2", name: "Напитки" },
  { id: "3", name: "Соки" },
  { id: "4", name: "Хлеб" },
];

const Product = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");

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
      newCart.splice(dishIndex, 1);
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const filteredDishes = dishes.filter(
    (dish) =>
      dish.category === selectedCategory &&
      dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginBottom: 75 }}>
      {/* Поиск */}
      <div
        style={{
          position: "sticky",
          top: 30,
          backgroundColor: "#fff",
          zIndex: 9,
        }}
      >
        <div
          style={{
            padding: "0 14px ",
            maxWidth: "1000px",
            marginTop: "10px",
          }}
        >
          <Input
            className="custom-allow-clear"
            size="large"
            allowClear
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Горизонтальные категории */}
        <div
          style={{
            // position: "sticky",
            // top: 100, // если есть header, учти его высоту
            // zIndex: 10,
            overflowX: "auto",
            display: "flex",
            padding: "8px 12px",
            gap: "8px",
            scrollbarWidth: "none",
          }}
        >
          {categories.map((category) => (
            <Button
              size="large"
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchTerm("");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                backgroundColor:
                  selectedCategory === category.id ? "#1677ff" : "#fff",
                color: selectedCategory === category.id ? "#fff" : "#000",
                fontWeight:
                  selectedCategory === category.id ? "bold" : "normal",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Блюда */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            gap: "10px",
            padding: "0 7px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {filteredDishes.length === 0 ? (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: "30px",
                fontSize: "24px",
                color: "#888",
              }}
            >
              Ничего не найдено
            </div>
          ) : (
            filteredDishes.map((dish) => {
              const currentDish = cart.find((item) => item.id === dish.id);
              const quantity = currentDish ? currentDish.quantity : 0;

              return (
                <div
                  key={dish.id}
                  style={{
                    width: "115px",
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
                      <b style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {dish.name}
                      </b>
                    </span>
                    <div style={{ margin: "10px 0 10px" }}>
                      <b style={{ fontSize: "14px", fontWeight: "bold" }}>
                        Цена:
                      </b>{" "}
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
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
