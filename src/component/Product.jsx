import { Button, Input, Popover, Skeleton } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../App.css";
import "../component/styles/Product.scss"; // Подключаем стили для компонента
import {
  MinusOutlined,
  PlusOutlined,
  AppstoreOutlined,
  AppstoreAddOutlined,
  FileImageOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Product = () => {
  const [dishes, setDishes] = useState(() => {
    const cachedDishes = localStorage.getItem("dishes");
    return cachedDishes ? JSON.parse(cachedDishes) : [];
  });
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [columnsCount, setColumnsCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(() => {
    const cachedCategories = localStorage.getItem("categories");
    return cachedCategories ? JSON.parse(cachedCategories) : [];
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Пытаемся получить свежие данные
        const [categoriesRes, dishesRes] = await Promise.all([
          axios.get("https://chechnya-product.ru/api/categories"),
          axios.get("https://chechnya-product.ru/api/products"),
        ]);

        const allCategory = { id: "all", name: "Все", sortOrder: -1 };
        const sortedCategories = [
          allCategory,
          ...categoriesRes.data.data.sort(
            (a, b) => a.sort_order - b.sort_order
          ),
        ];

        setCategories(sortedCategories);
        setDishes(dishesRes.data.data);

        // Сохраняем в localStorage
        localStorage.setItem("categories", JSON.stringify(sortedCategories));
        localStorage.setItem("dishes", JSON.stringify(dishesRes.data.data));
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);

        // Если онлайн, но ошибка - пытаемся получить из кеша через Service Worker
        if (navigator.onLine) {
          const cachedResponse = await caches.match(
            "https://chechnya-product.ru/api/products"
          );
          if (cachedResponse) {
            const data = await cachedResponse.json();
            setDishes(data.data || []);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Если оффлайн, сначала проверяем кеш Service Worker
    if (isOffline) {
      caches
        .match("https://chechnya-product.ru/api/products")
        .then((response) => {
          if (response) {
            return response.json();
          }
          throw new Error("No cached data");
        })
        .then((data) => {
          setDishes(data.data || []);
          setLoading(false);
        })
        .catch(() => {
          // Если нет в кеше SW, используем localStorage
          setLoading(false);
        });
    } else {
      fetchData();
    }
  }, [isOffline]);

  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        // При восстановлении соединения обновляем данные
        setIsOffline(false);
        setLoading(true);
        // Здесь можно добавить логику для фонового обновления данных
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isOffline]);

  const getGridTemplateColumns = () => {
    return columnsCount === 2
      ? "repeat(2, minmax(160px, 1fr))"
      : "repeat(3, minmax(105px, 1fr))";
  };

  const handleAddToCart = (dishId) => {
    const item = cart.find((item) => item.id === dishId);

    if (item && item.quantity >= 10) return; // Проверка на ограничение 10
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
    .filter(
      (dish) =>
        selectedCategory === "all" || dish.category_id === selectedCategory
    )
    .filter((dish) =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const calculateTotal = () => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return new Intl.NumberFormat("ru-RU").format(total);
  };

  let charCount = 0;
  const visibleCategories = [];
  const hiddenCategories = [];
  const MAX_CHAR_COUNT = 26;

  for (const category of categories) {
    if (charCount + category.name.length <= MAX_CHAR_COUNT) {
      visibleCategories.push(category);
      charCount += category.name.length;
    } else {
      hiddenCategories.push(category);
    }
  }

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
          {visibleCategories.map((category) => (
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

          {hiddenCategories.length > 0 && (
            <Popover
              placement="bottom"
              content={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxHeight: 200,
                    overflowY: "auto",
                    width: 150,
                  }}
                >
                  {hiddenCategories.map((category) => (
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
              }
              trigger="click"
            >
              <Button size="middle" icon={<EllipsisOutlined />} />
            </Popover>
          )}
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
          style={{
            gridTemplateColumns: getGridTemplateColumns(),
            ...(cart.length > 0 && { marginBottom: 50 }),
          }}
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
              const isUnavailable = !dish.availability;

              return (
                <div
                  key={dish.id}
                  className={`product-card ${isUnavailable ? "inactive" : ""}`}
                >
                  <div
                    className="product-card-content"
                    onClick={() => !isUnavailable && handleAddToCart(dish.id)}
                    style={{ pointerEvents: isUnavailable ? "none" : "auto" }}
                  >
                    <div className="product-card-emoji">
                      {dish.url ? (
                        <img
                          style={{
                            width: columnsCount === 2 ? "100px" : "50px",
                          }}
                          src={dish.url}
                          alt=""
                        />
                      ) : (
                        <FileImageOutlined
                          style={{ fontSize: "48px", color: "#ccc" }}
                        />
                      )}
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

                  <div
                    className={
                      quantity === 0
                        ? "product-card-actions2"
                        : "product-card-actions"
                    }
                  >
                    {isUnavailable ? (
                      <div className="product-card-unavailable">
                        Нет в наличии
                      </div>
                    ) : quantity === 0 ? (
                      <Button
                        size={columnsCount === 3 ? "small" : "medium"}
                        onClick={() => handleAddToCart(dish.id)}
                        className="product-btn-add"
                      >
                        В корзину
                      </Button>
                    ) : (
                      <>
                        <Button
                          size={columnsCount === 3 ? "small" : "large"}
                          onClick={() => handleDecreaseQuantity(dish.id)}
                          className="product-btn-minus"
                        >
                          <MinusOutlined />
                        </Button>
                        {cart.find((item) => item.id === dish.id)?.quantity >=
                          10 && (
                          <div
                            style={{
                              padding: "0 4px",
                              fontSize: 11,
                              color: "red",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            Макс. 10 шт
                          </div>
                        )}
                        <Button
                          size={columnsCount === 3 ? "small" : "large"}
                          onClick={() => handleAddToCart(dish.id)}
                          disabled={
                            cart.find((item) => item.id === dish.id)
                              ?.quantity >= 10
                          }
                          className="product-btn-plus"
                          style={{
                            opacity:
                              cart.find((item) => item.id === dish.id)
                                ?.quantity >= 10
                                ? 0.4
                                : 1,
                            pointerEvents:
                              cart.find((item) => item.id === dish.id)
                                ?.quantity >= 10
                                ? "none"
                                : "auto",
                          }}
                        >
                          <PlusOutlined />
                        </Button>
                        <span className="product-card-quantity">
                          <b>{quantity}</b>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {cart.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 70,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1000000,
            padding: "0 16px",
          }}
        >
          <Button
            type="primary"
            size="large"
            block
            onClick={() => navigate("/cart")}
            style={{
              height: 50,
              fontSize: 16,
              display: "flex",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}
          >
            <div>
              {cart.reduce((acc, item) => acc + item.quantity, 0)} товаров
            </div>
            <div>К оформлению</div>
            <div>{calculateTotal()} ₽</div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Product;
