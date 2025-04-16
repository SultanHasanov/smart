import { Button, Input, Skeleton } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../App.css";
import "../component/styles/Product.scss"; // Подключаем стили для компонента
import {
  MinusOutlined,
  PlusOutlined,
  AppstoreOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";

const Product = () => {
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  console.log({ dishes });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [columnsCount, setColumnsCount] = useState(3);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://44899c88203381ec.mokky.dev/categories"
        );
        const allCategory = { id: "all", name: "Все", sortOrder: -1 };
        const sorted = [
          allCategory,
          ...res.data.sort((a, b) => a.sortOrder - b.sortOrder),
        ];
        setCategories(sorted);

        // if (sorted.length > 0 && !selectedCategory) {
        //   setSelectedCategory(sorted[0].id);
        // }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get(
          "https://44899c88203381ec.mokky.dev/items"
        );
        setDishes(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке блюд:", error);
      } finally {
        setLoading(false); // <- флаг отключается при завершении загрузки
      }
    };
    fetchDishes();
  }, []);
  

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
      newCart.push({
        id: dishId,
        quantity: 1,
        name: dish.name,
        price: dish.price,
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

  const shuffledAllDishes = useMemo(() => {
    if (selectedCategory === "all") {
      return [...dishes].sort(() => Math.random() - 0.5);
    }
    return dishes;
  }, [dishes, selectedCategory]);
  

  const filteredDishes = shuffledAllDishes
  .filter(dish => selectedCategory === "all" || dish.category === selectedCategory)
  .filter(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()));


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
          {loading ? (
  Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="product-card">
      <Skeleton.Image style={{ width: "100%", height: 80 }} active />
      <Skeleton active title={false} paragraph={{ rows: 2 }} />
    </div>
  ))
) : filteredDishes.length === 0 ? (
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
                    <div className="product-card-emoji">
                      <img
                        style={{
                          width: columnsCount === 2 && "100px",
                        }}
                        src={dish.emoji}
                        alt=""
                      />
                    </div>
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
