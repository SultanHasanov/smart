import { Button, Input } from "antd";
import React, { useState } from "react";
import "../App.css";
import "../component/styles/Product.scss"; // Подключаем стили для компонента
import {
  MinusOutlined,
  PlusOutlined,
  AppstoreOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import dishes from "../data";

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
  const [columnsCount, setColumnsCount] = useState(3);

  const getGridTemplateColumns = () => {
    return columnsCount === 2
      ? "repeat(2, minmax(160px, 1fr))"
      : "repeat(3, minmax(105px, 1fr))";
  };

  const handleAddToCart = (dishId) => {
    const newCart = [...cart];
    const dishIndex = newCart.findIndex((item) => item.id === dishId);

    if (dishIndex > -1) {
      newCart[dishIndex].quantity += 1;
    } else {
      const dish = dishes.find((dish) => dish.id === dishId);
      newCart.push({ id: dishId, quantity: 1, name: dish.name, price: dish.price });
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
    <div className="product-wrapper">
      <div className="product-search-container">
        <div className="product-search-input">
          <Input
            className="custom-allow-clear"
            size="large"
            allowClear
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="product-categories">
          {categories.map((category) => (
            <Button
              size="middle"
              key={category.id}
              className={`product-category-button ${
                selectedCategory === category.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchTerm("");
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="product-toggle">
        <Button
          shape="circle"
          icon={
            columnsCount === 3 ? <AppstoreAddOutlined /> : <AppstoreOutlined />
          }
          onClick={() => setColumnsCount(columnsCount === 3 ? 2 : 3)}
        />
      </div>

      <div className="product-grid-wrapper">
        <div
          className="product-grid"
          style={{ gridTemplateColumns: getGridTemplateColumns() }}
        >
          {filteredDishes.length === 0 ? (
            <div className="product-empty">Ничего не найдено</div>
          ) : (
            filteredDishes.map((dish) => {
              const currentDish = cart.find((item) => item.id === dish.id);
              const quantity = currentDish ? currentDish.quantity : 0;

              return (
                <div key={dish.id} className="product-card">
                  <div
                    className="product-card-content"
                    onClick={() => handleAddToCart(dish.id)}
                  >
                    <div className="product-card-emoji">{dish.emoji}</div>
                    <span className="product-card-title">
                      <b>
                        {dish.name.length > 12
                          ? dish.name.slice(0, 10) + "..."
                          : dish.name}
                      </b>
                    </span>
                    <div className="product-card-price">
                      <b>Цена:</b> {dish.price} ₽
                    </div>
                  </div>

                  <div className="product-card-actions">
                    <Button
                      size={columnsCount === 3 ? "small" : "large"}
                      onClick={() => handleDecreaseQuantity(dish.id)}
                      className="product-btn-minus"
                    >
                      <MinusOutlined />
                    </Button>
                    <Button
                      size={columnsCount === 3 ? "small" : "large"}
                      onClick={() => handleAddToCart(dish.id)}
                      className="product-btn-plus"
                    >
                      <PlusOutlined />
                    </Button>
                  </div>

                  {quantity > 0 && (
                    <span className="product-card-quantity">
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
