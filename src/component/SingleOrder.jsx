import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Typography, Spin, Tag, message, Button } from "antd";

const { Paragraph, Text } = Typography;
const ORDER_API = "https://chechnya-product.ru/api/orders";

const getStatusColor = (status) => {
  switch (status) {
    case "новый":
      return "orange";
    case "принят":
      return "blue";
    case "собирается":
      return "purple";
    case "в пути":
      return "cyan";
    case "доставлен":
    case "готов":
      return "green";
    case "отклонен":
      return "red";
    default:
      return "default";
  }
};
const WS_URL = "wss://chechnya-product.ru/ws/orders";
const SingleOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);
  const wsRef = useRef(null);
  
  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${ORDER_API}/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data.data);
    } catch (e) {
      message.error("Ошибка загрузки заказа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket подключён");
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket ошибка:", err);
    };

    socket.onclose = () => {
      console.warn("⚠ WebSocket закрыт");
    };

    socket.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        if (
          messageData.type === "new_order" ||
          messageData.type === "status_update"
        ) {
          const incoming = messageData.order;
          if (incoming.id === Number(orderId)) {
            setOrder((prevOrder) => ({ ...prevOrder, ...incoming }));
          }
        }
      } catch (e) {
        console.error("Ошибка обработки WebSocket-сообщения:", e);
      }
    };

    return () => {
      socket.close();
    };
  }, [orderId]);

  if (loading) return <Spin size="large" />;
  if (!order) return <Text>Заказ не найден</Text>;

  const itemsToShow = showAllItems 
    ? order.items 
    : order.items?.slice(0, 4);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 5 }}>
      <h2>Заказ #{order.id}</h2>
      <Paragraph>
        <Text strong>Имя:</Text> {order.name}
      </Paragraph>
      <Paragraph>
        <Text strong>Дата:</Text>{" "}
        {new Date(order.date_orders).toLocaleString("ru-RU")}
      </Paragraph>
      <Paragraph>
        <Text strong>Статус:</Text>{" "}
        <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
      </Paragraph>
      <Paragraph>
        <Text strong>Адрес:</Text> {order.address || "Не указан"}
      </Paragraph>
      <Paragraph>
        <Text strong>Тип доставки:</Text>{" "}
        {order.delivery_type === "delivery" ? "Доставка" : "Самовывоз"}
      </Paragraph>
      {order.order_comment && (
        <Paragraph>
          <Text strong>Комментарий:</Text> {order.order_comment}
        </Paragraph>
      )}
      <Paragraph>
        <Text strong>Товары:</Text>
        <ul>
          {itemsToShow?.map((item) => (
            <li key={item.id}>
              {item.name} x{item.quantity} = {item.price * item.quantity}₽
            </li>
          ))}
        </ul>
        {order.items?.length > 4 && (
          <Button 
            type="link" 
            onClick={() => setShowAllItems(!showAllItems)}
          >
            {showAllItems ? "Скрыть" : "Показать еще..."}
          </Button>
        )}
      </Paragraph>
      <Paragraph>
        <Text strong>Сумма:</Text> {order.total}₽
      </Paragraph>
    </div>
  );
};

export default SingleOrder;