import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Typography, Spin, Tag, message } from "antd";

const { Paragraph, Text } = Typography;
const ORDER_API = "https://chechnya-product.ru/api/admin/orders";

const getStatusColor = (status) => {
  switch (status) {
    case "новый":
      return "orange";
    case "принят":
      return "blue";
    case "в обработке":
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

const SingleOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [orderId]);

  if (loading) return <Spin size="large" />;
  if (!order) return <Text>Заказ не найден</Text>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>Заказ #{order.id}</h2>
      <Paragraph>
        <Text strong>Имя:</Text> {order.name}
      </Paragraph>
      <Paragraph>
        <Text strong>Дата:</Text> {new Date(order.date_orders).toLocaleString("ru-RU")}
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
      <Paragraph>
        <Text strong>Товары:</Text>
        <ul>
          {order.items?.map((item) => (
            <li key={item.id}>
              {item.name} x{item.quantity} = {item.price * item.quantity}₽
            </li>
          ))}
        </ul>
      </Paragraph>
      <Paragraph>
        <Text strong>Сумма:</Text> {order.total}₽
      </Paragraph>
    </div>
  );
};

export default SingleOrder;
