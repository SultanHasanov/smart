import { useEffect, useState } from "react";
import { Button, Checkbox, Input, message, Radio, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  DeleteFilled,
  PlusOutlined,
  MinusOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import AddressInput from "../component/AddressInput";
import axios from "axios";
import "../component/styles/Product.scss";
import { div } from "framer-motion/client";
import CartList from "../component/CartList";

const { Text } = Typography;
const ADMIN_PHONE = "+79298974969";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [test, setTest] = useState(1);
  useEffect(() => {
    setTest(cart.length !== 0 ? 1 : 2);
  }, [cart.length]);

  const [orderData, setOrderData] = useState({
    name: "",
    deliveryType: "",
    paymentType: "",
    address: query,
    changeFor: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart
      .filter((item) => selectedIds.includes(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleRemoveFromCart = (dishId) => {
    const newCart = cart.filter((item) => item.id !== dishId);
    updateCart(newCart);
    setSelectedIds((prev) => prev.filter((id) => id !== dishId));
  };

  const handleRemoveSelected = () => {
    const newCart = cart.filter((item) => !selectedIds.includes(item.id));
    updateCart(newCart);
    setSelectedIds([]);
    setOrderData({
      name: "",
      deliveryType: "",
      paymentType: "",
      address: query,
      changeFor: "",
    })
  };

  const increaseQuantity = (dishId) => {
    const newCart = cart.map((item) =>
      item.id === dishId ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(newCart);
  };

  const decreaseQuantity = (dishId) => {
    const newCart = cart
      .map((item) =>
        item.id === dishId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(newCart);
  };

  const toggleSelected = (dishId) => {
    setSelectedIds((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId]
    );
  };
  const sendOrderToWhatsApp = async () => {
    const selectedItems = cart.filter((item) => selectedIds.includes(item.id));

    if (selectedItems.length === 0) return message.error("Ничего не выбрано!");
    if (!orderData.name) return message.error("Введите имя!");
    if (orderData.deliveryType === "delivery" && !query)
      return message.error("Введите адрес доставки!");
    if (
      orderData.paymentType === "cash" &&
      orderData.deliveryType === "delivery" &&
      !orderData.changeFor
    )
      return message.error("Введите сумму, с которой нужна сдача!");

    let cartDetails = "";
    let totalAmount = 0;

    selectedItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      cartDetails += `${item.name} x${item.quantity} = ${itemTotal} ₽\n`;
      totalAmount += itemTotal;
    });

    let deliveryFee = 0;
    if (orderData.deliveryType === "delivery" && totalAmount < 1000) {
      deliveryFee = 500;
    }

    const finalTotal = totalAmount + deliveryFee;
    let paymentDetails = "";

    if (orderData.paymentType === "transfer") {
      paymentDetails = `Оплата: Перевод (Карта: 1234 5678 9012 3456)\n`;
    } else if (
      orderData.paymentType === "cash" &&
      orderData.deliveryType === "delivery"
    ) {
      paymentDetails = `Оплата: Наличными (Сдача с ${orderData.changeFor} ₽)\n`;
    } else {
      paymentDetails = "Оплата: Наличными\n";
    }

    const deliveryText =
      orderData.deliveryType === "delivery"
        ? `Доставка: ${orderData.address}\n${
            deliveryFee ? "Доставка: +500 ₽\n" : "0 ₽\n"
          }`
        : "Самовывоз\n";

    const whatsappMessage = `
\`Заказ\`
Имя: ${orderData.name}
Тип: ${orderData.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
${paymentDetails}
${deliveryText}
${orderData.deliveryType === "delivery" ? `Адрес: ${query}` : ""}
\`Ваш заказ:\`
${cartDetails}
Общая сумма: ${finalTotal} ₽`;

    // const whatsappURL = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
    //   whatsappMessage
    // )}`;

    // window.open(whatsappURL, "_blank");

    // 2. Отправка на API
    try {
      await axios.post("https://44899c88203381ec.mokky.dev/orders", {
        name: orderData.name,
        address: orderData.deliveryType === "delivery" ? query : null,
        items: selectedItems,
        deliveryFee: deliveryFee,
        deliveryText: deliveryText,
        total: finalTotal,
        deliveryType: orderData.deliveryType,
        paymentType: orderData.paymentType,
        changeFor:
          orderData.paymentType === "cash" ? orderData.changeFor || null : null,
        status: "новый",
        createdAt: Date.now(),
      });

      message.success("Заказ отправлен админу и сохранён в системе!");
    } catch (error) {
      message.error("Ошибка при сохранении заказа на сервере");
      console.error("Ошибка API:", error);
    }

    setOrderData({
      name: "",
      deliveryType: "pickup",
      address: "",
      paymentType: "cash",
      changeFor: "",
    });

    // Удаляем только отправленные
    const remaining = cart.filter((item) => !selectedIds.includes(item.id));
    updateCart(remaining);
    setSelectedIds([]);
  };

  return (
    <>
      <div
        style={{
          padding: "10px",
          // position: "relative",
        }}
      >
        {cart.length !== 0 && <h2>Ваш заказ:</h2>}

        {cart.length > 0 ? (
          <>
            <Button
              onClick={() => {
                if (selectedIds.length === cart.length) {
                  setSelectedIds([]); // Снимаем всё
                } else {
                  setSelectedIds(cart.map((item) => item.id)); // Выбираем всё
                }
              }}
              style={{ marginBottom: 10 }}
            >
              {selectedIds.length === cart.length
                ? "Снять выделение"
                : "Выбрать всё"}
            </Button>

            <CartList
              cart={cart}
              selectedIds={selectedIds}
              toggleSelected={toggleSelected}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              handleRemoveFromCart={handleRemoveFromCart}
            />
          </>
        ) : (
          <div
            style={{
              height: "50vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#ccc",
              fontSize: "18px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <ShoppingOutlined style={{ fontSize: 60, marginBottom: 16 }} />
            <div>Корзина пуста</div>
          </div>
        )}

        {test === 1 && (
          <div style={{ marginTop: "10px", display: "flex", gap: 8 }}>
            {cart.length !== 0 && (
              <Button
                danger
                onClick={handleRemoveSelected}
                disabled={selectedIds.length === 0}
              >
                Удалить выбранные
              </Button>
            )}

            <Button onClick={() => navigate("/")} icon={<PlusOutlined />}>
              {cart.length !== 0 ? "Добавить ещё" : "Добавить товары"}
            </Button>
          </div>
        )}

        {cart.length !== 0 && (
          <div style={{ marginTop: "10px" }}>
            <Text
              style={{
                fontSize: 17,
                color: "green",
                textDecoration: "underline",
              }}
              strong
            >
              Итоговая сумма: {calculateTotal()} ₽
            </Text>
          </div>
        )}

        {cart.length !== 0 && (
          <div style={{ marginTop: 20 }}>
            <Input
              size="large"
              placeholder="Имя"
              value={orderData.name}
              onChange={(e) =>
                setOrderData({ ...orderData, name: e.target.value })
              }
              style={{ marginBottom: 10 }}
            />

            <Radio.Group
              size="large"
              value={orderData.paymentType}
              onChange={(e) =>
                setOrderData({ ...orderData, paymentType: e.target.value })
              }
              style={{ marginBottom: 10 }}
            >
              <Radio.Button value="cash">Наличными</Radio.Button>
              <Radio.Button value="transfer">Перевод</Radio.Button>
            </Radio.Group>

            {orderData.paymentType === "cash" &&
              orderData.deliveryType === "delivery" && (
                <Input
                  size="large"
                  placeholder="С какой суммы нужна сдача?"
                  value={orderData.changeFor}
                  onChange={(e) =>
                    setOrderData({ ...orderData, changeFor: e.target.value })
                  }
                  style={{ marginBottom: 10 }}
                />
              )}

            <Radio.Group
              size="large"
              value={orderData.deliveryType}
              onChange={(e) =>
                setOrderData({ ...orderData, deliveryType: e.target.value })
              }
              style={{ marginBottom: 10 }}
            >
              <Radio.Button value="pickup">Самовывоз</Radio.Button>
              <Radio.Button value="delivery">Доставка</Radio.Button>
            </Radio.Group>
          </div>
        )}
        {orderData.deliveryType === "delivery" && (
          <AddressInput
            query={query}
            setQuery={setQuery}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            setSuggestions={setSuggestions}
            suggestions={suggestions}
          />
        )}
        <div style={{ marginBottom: 50 }}>
          {cart.length !== 0 && suggestions.length === 0 && (
            <Button
              style={{
                height: 50,
                fontSize: 20,
              }}
              size="large"
              type="primary"
              block
              onClick={sendOrderToWhatsApp}
            >
              Оформить заказ
            </Button>
          )}
        </div>
      </div>

      {test === 2 && (
        <Button
          size="large"
          style={{
            top: 60,

            fontSize: 20,
            color: "green",
            width: "100%",
            height: 50,
          }}
          onClick={() => navigate("/")}
          icon={<PlusOutlined />}
        >
          {cart.length === 0 && "Добавить товары"}
        </Button>
      )}
    </>
  );
};

export default CartPage;
