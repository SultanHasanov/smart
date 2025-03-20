import { Button, Typography, Tabs } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { DeleteFilled, MinusOutlined, PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TabPane } = Tabs;

// Example dishes with categories
const categories = [
  { id: "1", name: "Блюда" },
  { id: "6", name: "Фастфуд" },
  { id: "2", name: "Напитки" },
  { id: "3", name: "Соки" },
  { id: "4", name: "Хлеб" },
  { id: "5", name: "Кофе" },
];

const dishes = [
  { id: 1, name: "Пицца", price: 500, emoji: "🍕", category: "6" },
  { id: 2, name: "Суши", price: 300, emoji: "🍣", category: "1" },
  { id: 3, name: "Бургер", price: 350, emoji: "🍔", category: "6" },
  { id: 4, name: "Салат", price: 150, emoji: "🥗", category: "1" },
  { id: 5, name: "Стейк", price: 700, emoji: "🥩", category: "1" },
  { id: 6, name: "Десерт", price: 200, emoji: "🍰", category: "1" },
  { id: 7, name: "Кола", price: 100, emoji: "🥤", category: "2" },
  { id: 8, name: "Минералка", price: 50, emoji: "💧", category: "2" },
  { id: 9, name: "Лимонад", price: 150, emoji: "🍋", category: "2" },
  { id: 10, name: "Апельсиновый сок", price: 120, emoji: "🍊", category: "3" },
  { id: 11, name: "Яблочный сок", price: 100, emoji: "🍏", category: "3" },
  { id: 12, name: "Виноградный сок", price: 130, emoji: "🍇", category: "3" },
  { id: 13, name: "Чиабатта", price: 90, emoji: "🍞", category: "4" },
  { id: 14, name: "Багет", price: 120, emoji: "🥖", category: "4" },
  { id: 15, name: "Кофе латте", price: 180, emoji: "☕", category: "5" },
  { id: 16, name: "Эспрессо", price: 150, emoji: "☕", category: "5" },
  { id: 17, name: "Капучино", price: 160, emoji: "☕", category: "5" },
  { id: 18, name: "Американо", price: 140, emoji: "☕", category: "5" },
  { id: 19, name: "Паста карбонара", price: 550, emoji: "🍝", category: "1" },
  { id: 20, name: "Паста Болоньезе", price: 480, emoji: "🍝", category: "1" },
  { id: 21, name: "Рамен", price: 400, emoji: "🍜", category: "1" },
  { id: 22, name: "Чизбургер", price: 350, emoji: "🍔", category: "6" },
  { id: 23, name: "Том Ям", price: 350, emoji: "🍲", category: "1" },
  {
    id: 24,
    name: "Моцарелла",
    price: 200,
    emoji: "🧀",
    category: "1",
  },
  { id: 25, name: "Латте макиато", price: 190, emoji: "☕", category: "5" },
  { id: 26, name: "Трюфельный бургер", price: 700, emoji: "🍔", category: "6" },
  { id: 27, name: "Тирамису", price: 250, emoji: "🍮", category: "1" },
  { id: 29, name: "Греческий салат", price: 250, emoji: "🥗", category: "1" },
  { id: 30, name: "Фокачча", price: 180, emoji: "🍞", category: "4" },
  { id: 31, name: "Цезарь", price: 300, emoji: "🥗", category: "1" },
  {
    id: 32,
    name: "Классический чизкейк",
    price: 200,
    emoji: "🍰",
    category: "1",
  },
  {
    id: 33,
    name: "Суп-пюре из брокколи",
    price: 180,
    emoji: "🥣",
    category: "1",
  },
  { id: 34, name: "Свежий сок", price: 120, emoji: "🍊", category: "3" },
  {
    id: 35,
    name: "Капучино с карамелью",
    price: 170,
    emoji: "☕",
    category: "5",
  },
  {
    id: 36,
    name: "Гранола с йогуртом",
    price: 160,
    emoji: "🍧",
    category: "1",
  },
  { id: 37, name: "Мохито", price: 200, emoji: "🍹", category: "2" },
  { id: 38, name: "Виски с колой", price: 250, emoji: "🥃", category: "2" },
  { id: 39, name: "Кофе с молоком", price: 130, emoji: "☕🥛", category: "5" },
  { id: 40, name: "Чай с лимоном", price: 100, emoji: "🍵🍋", category: "5" },
];

const Product = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("1");

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

  const handleReserveTable = () => {
    navigate("/booking");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleRemoveFromCart = (dishId) => {
    const newCart = cart.filter((item) => item.id !== dishId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const filteredDishes = dishes.filter(
    (dish) => dish.category === selectedCategory
  );

  return (
    <div style={{ padding: 10 }}>
      <Tabs defaultActiveKey="1" onChange={setSelectedCategory}>
        {categories.map((category) => (
          <TabPane tab={category.name} key={category.id} />
        ))}
      </Tabs>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {filteredDishes.map((dish) => {
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
                  <b style={{ fontSize: "14px", fontWeight: "bold" }}>
                    {dish.name}
                  </b>
                </span>
                <div style={{ margin: "10px 0 10px" }}>
                  <b style={{ fontSize: "14px", fontWeight: "bold" }}>Цена:</b>{" "}
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
                    right: "0",
                    top: "50%",
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
            position: "fixed", // Зафиксируем кнопку
            bottom: "10px", // Расстояние от нижней границы экрана
            right: "20px", // Центрируем кнопку по горизонтали
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            width: "auto", // Ширина кнопки будет автоматически подстраиваться
            cursor: "pointer",
          }}
        >
          Бронь столика
        </Button>
      </div>
    </div>
  );
};

export default Product;
