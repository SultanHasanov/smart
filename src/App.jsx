import { useEffect, useState } from "react";
import { Button, Checkbox, Input, message, Radio, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  DeleteFilled,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import TabIcons from "./component/TabIcons";
import AddressInput from "./component/AddressInput";

const { Text } = Typography;
const ADMIN_PHONE = "+79298974969";

const App = () => {
  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [orderData, setOrderData] = useState({
    name: "",
    deliveryType: "pickup",
    paymentType: "cash",
    address: "",
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

  const sendOrderToWhatsApp = () => {
    const selectedItems = cart.filter((item) =>
      selectedIds.includes(item.id)
    );

    if (selectedItems.length === 0) return message.error("Ничего не выбрано!");
    if (!orderData.name) return message.error("Введите имя!");
    if (orderData.deliveryType === "delivery" && !orderData.address)
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
        ? `Доставка: ${orderData.address}\n${deliveryFee ? "Доставка: +500 ₽\n" : ""}`
        : "Самовывоз\n";

    const whatsappMessage = `
\`Заказ\`
Имя: ${orderData.name}
Тип: ${orderData.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
${orderData.deliveryType === "delivery" ? `Адрес: ${orderData.address}` : ""}
${paymentDetails}
${deliveryText}
\`Ваш заказ:\`
${cartDetails}
Общая сумма: ${finalTotal} ₽`;

    const whatsappURL = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappURL, "_blank");
    message.success("Заказ отправлен админу!");

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
      <div style={{ padding: "20px" }}>
        <h2>Ваш заказ:</h2>
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
      {selectedIds.length === cart.length ? "Снять выделение" : "Выбрать всё"}
    </Button>

    {cart.map((item) => (
      <div
        key={item.id}
        style={{
          marginBottom: "10px",
          position: "relative",
          display: "flex",
          alignItems: "center",
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
  </>
) : (
  <div>Ничего не выбрано</div>
)}

        <div style={{ marginTop: "10px", display: "flex", gap: 8 }}>
          <Button
            danger
            onClick={handleRemoveSelected}
            disabled={selectedIds.length === 0}
          >
            Удалить выбранные
          </Button>
          <Button
            onClick={() => navigate("/")}
            icon={<PlusOutlined />}
          >
            Добавить ещё
          </Button>
        </div>

        <div style={{ marginTop: "10px" }}>
          <Text
            style={{ fontSize: 17, color: "green", textDecoration: "underline" }}
            strong
          >
            Итоговая сумма: {calculateTotal()} ₽
          </Text>
        </div>

        <div style={{ marginTop: 20 }}>
          <Input
            size="large"
            placeholder="Имя"
            value={orderData.name}
            onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
            style={{ marginBottom: 10 }}
          />

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

          {orderData.deliveryType === "delivery" && (
            <Input
              size="large"
              placeholder="Адрес доставки"
              value={orderData.address}
              onChange={(e) =>
                setOrderData({ ...orderData, address: e.target.value })
              }
              style={{ marginBottom: 10 }}
            />
          )}

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

          <Button
            size="large"
            type="primary"
            block
            disabled={selectedIds.length === 0}
            onClick={sendOrderToWhatsApp}
          >
            Оформить заказ
          </Button>
        </div>
      </div>
      <h1>Введите адрес</h1>
      <AddressInput />
      <TabIcons />
    </>
  );
};

export default App;
