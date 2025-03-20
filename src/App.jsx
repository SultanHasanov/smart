import { useEffect, useState } from "react";
import { Button, Input, message, Radio, Tabs, Typography } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminPanelButton from "./component/AdminPanelButton";
import ButtonCard from "./component/ButtonCard";
import ReservationModal from "./component/ReservationModal";
import { useTimeContext } from "./TimeContext";
import TabPane from "antd/es/tabs/TabPane";
import { DeleteFilled, PlusOutlined } from "@ant-design/icons";
const { Text } = Typography;
const ADMIN_PHONE = "+79667283100";

const API_URL = "https://1c298a0f688767c5.mokky.dev/items";

const App = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { countdownTime, setCountdowns, activeTab, setActiveTab } =
    useTimeContext();
  console.log(activeTab);
  const [orderData, setOrderData] = useState({
    name: "",
    deliveryType: "pickup", // "pickup" или "delivery"
    paymentType: "cash", // "cash" или "transfer"
    address: "",
    changeFor: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      // console.log({data})
      setTables(data);
    } catch (error) {
      message.error("Ошибка загрузки столиков");
    } finally {
      setLoading(false);
    }
  };

  const sendToWhatsApp = async (values) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let cartDetails = "";
    let totalAmount = 0;

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      cartDetails += `${item.name} x${item.quantity} = ${itemTotal} ₽\n`;
      totalAmount += itemTotal;
    });

    const whatsappMessage = `
\`Запрос на бронь\`
Столик №${selectedTable.id}
Имя: ${values.name}
Время: ${values.time}
Человек: ${values.people}
\`Ваши выбранные блюда:\`
${cartDetails}
Общая сумма: ${totalAmount} ₽`;

    const whatsappURL = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappURL, "_blank");

    try {
      await axios.patch(`${API_URL}/${selectedTable.id}`, {
        name: values.name,
        time: values.time,
        people: values.people,
        pending: true,
        timestamp: Date.now(),
      });

      message.success("Запрос отправлен админу!");
      fetchTables();
    } catch (error) {
      message.error("Ошибка сохранения в API");
    }
  };

  const sendOrderToWhatsApp = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      message.error("Корзина пуста!");
      return;
    }
    if (!orderData.name) {
      return message.error("Введите имя!");
    }
    if (orderData.deliveryType === "delivery" && !orderData.address) {
      return message.error("Введите адрес доставки!");
    }
    if (
      orderData.paymentType === "cash" &&
      orderData.deliveryType === "delivery" &&
      !orderData.changeFor
    ) {
      return message.error("Введите сумму, с которой нужна сдача!");
    }

    let cartDetails = "";
    let totalAmount = 0;

    cart.forEach((item) => {
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
            deliveryFee ? `Доставка: +500 ₽ \n` : ""
          }`
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

    // Очистка корзины

    // Очистка формы
    setOrderData({
      name: "",
      deliveryType: "pickup",
      address: "",
      paymentType: "cash",
      changeFor: "",
    });
    localStorage.removeItem("cart");
    setCart([]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCountdowns = {};

      tables.forEach((table) => {
        if (table.pending && table.timestamp) {
          const elapsedSeconds = Math.floor((now - table.timestamp) / 1000);
          // const remainingSeconds = 120 - elapsedSeconds;
          const remainingSeconds = countdownTime - elapsedSeconds;

          if (remainingSeconds > 0) {
            newCountdowns[table.id] = remainingSeconds;
          } else {
            // Если время вышло, удаляем заявку
            axios
              .patch(`${API_URL}/${table.id}`, {
                name: "",
                time: "",
                people: "",
                reserved: false,
                pending: false,
              })
              .then(() => fetchTables());
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [tables, countdownTime]);
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleRemoveFromCart = (dishId) => {
    const newCart = cart.filter((item) => item.id !== dishId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };


  return (
    <>
      <AdminPanelButton navigate={navigate} />

      <Tabs
        activeKey={activeTab}
        defaultActiveKey="order"
        onChange={setActiveTab}
      >
        <TabPane tab="Только заказ" key="order">
          <div style={{ padding: "0px 20px" }}>
            <h2>Ваш заказ:</h2>
            {cart.length > 0 &&
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
                    {item.name} x{item.quantity} = {item.price * item.quantity}{" "}
                    ₽
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
            }
           
<div>{cart.length === 0 && "Ничего не выбрано"}</div>
          <Button
            danger
            onClick={() => navigate("/")}
            style={{ border: "none", padding: "0px" }}
          >
            <PlusOutlined />
            {cart.length === 0 ? "Выбрать блюда" : "Добавить еще"}
          </Button>
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
          </div>
          <div style={{ padding: 20 }}>
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
              onClick={sendOrderToWhatsApp}
            >
              Оформить заказ
            </Button>
          </div>
        </TabPane>

        <TabPane tab="Заказ + бронь столика" key="order_reservation">
          <div className="grid-container">
            <ButtonCard
              tables={tables}
              setSelectedTable={setSelectedTable}
              setModalVisible={setModalVisible}
            />

            <ReservationModal
              selectedTable={selectedTable}
              sendToWhatsApp={sendToWhatsApp}
              setModalVisible={setModalVisible}
              modalVisible={modalVisible}
            />

            <style>
              {`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            padding: 20px;
          }

          .table-button {
            height: 100px;
          }

          @media (max-width: 768px) {
            .grid-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 480px) {
            .grid-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
            </style>
          </div>
        </TabPane>
      </Tabs>
    </>
  );
};

export default App;
