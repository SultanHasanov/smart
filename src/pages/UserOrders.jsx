import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Typography,
  Spin,
  Alert,
  Tag,
  Button,
  message,
  Space,
} from "antd";
import {
  CopyOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../component/styles/Product.scss"; // тот же стиль, что у OrderManager
import { DateTime } from "luxon";

const { Text, Paragraph } = Typography;

const statusFlow = ["новый", "принят", "в обработке", "в пути", "доставлен"];

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

const DeliveryTrack = ({ status }) => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const positionByStatus = {
      новый: 0,
      принят: 22.5,
      "в обработке": 45,
      "в пути": 67.5,
      доставлен: 90,
    };

    setPosition(positionByStatus[status] || 0);
  }, [status]);

  return (
    <div className="delivery-track">
      <div className="track-line">
        {statusFlow.map((step, index) => (
          <div
            key={step}
            className={`track-step ${
              index <= statusFlow.indexOf(status) ? "completed" : ""
            }`}
          >
            {step}
          </div>
        ))}
        <div
          className="car-icon"
          style={{
            left: `${position}%`,
          }}
        >
          <span style={{ display: "inline-block", transform: "scaleX(-1)" }}>
            🚗
          </span>
        </div>
      </div>
    </div>
  );
};

const UserOrders = () => {
  const { token, userRole } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  const toggleOrderDetails = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

 
const formatDate = (ts) => {
  const safeTs = ts.replace(/\.(\d{3})\d*Z$/, '.$1Z');
  return DateTime
    .fromISO(safeTs, { zone: 'utc' })
    .toFormat('dd.MM.yyyy, HH:mm:ss');
};



  const shareOrder = async (order) => {
    try {
      const shareUrl = `${window.location.origin}/orders/${order.id}`;
      const title = `Заказ от ${order.name}`;

      if (navigator.share) {
        await navigator.share({
          title,
          text: `Посмотри мой заказ ${order.name}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        message.success("Ссылка скопирована в буфер");
      }
    } catch (err) {
      console.error("Ошибка при шаринге:", err);
      message.error("Не удалось поделиться");
    }
  };

  useEffect(() => {
    if (!token || userRole !== "user") return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          "https://chechnya-product.ru/api/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data.data || []);
        console.log(response.data.data)
      } catch (err) {
        console.error("Ошибка получения заказов:", err);
        setError("Не удалось загрузить заказы. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, userRole]);

  if (userRole !== "user") {
    return <Alert type="info" message="Только пользователи могут видеть свои заказы." />;
  }

  if (loading) {
    return <Spin tip="Загружаем заказы..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (orders.length === 0) {
    return <Alert type="warning" message="У вас пока нет заказов." />;
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", }}>
      <Typography.Title level={3}>Мои заказы</Typography.Title>
      <div className="order-list">
        {orders.map((order) => {
          const itemList = order.items?.map((item) => (
            <li key={item.id}>
              {item.name} x{item.quantity} = {item.price * item.quantity}₽
            </li>
          ));

          return (
            <div key={order.id} className={`order-item ${order.status === 'доставлен' ? 'order-delivered' : ''}`}>
              <div
                className="order-summary"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <Space className="order-label">
                  <Text strong>{order.name}</Text>
                  <Tag
                    color={getStatusColor(order.status)}
                    style={{ cursor: "pointer" }}
                  >
                    {order.status}
                  </Tag>
                </Space>
              </div>

              {expandedOrder === order.id && (
                <div className="order-details">
                  <Paragraph>
                    <Text strong>Дата:</Text> {formatDate(order.created_at)}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Тип:</Text>{" "}
                    {order.delivery_type === "delivery"
                      ? "Доставка"
                      : "Самовывоз"}{" "}
                    {order.delivery_fee > 0 && `(+${order.delivery_fee}₽)`}
                  </Paragraph>
                  {order.delivery_type === "delivery" && (
                    <Paragraph>
                      <Text strong>Адрес:</Text> {order.address}
                    </Paragraph>
                  )}
                  <Paragraph>
                    <Text strong>Оплата:</Text>{" "}
                    {order.payment_type === "transfer"
                      ? "Перевод"
                      : order.payment_type === "cash" && order.change_for
                      ? `Наличные (сдача с ${order.change_for}₽)`
                      : "Наличные"}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Товары:</Text>
                    <ul>{itemList}</ul>
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Сумма:</Text> {order.total}₽
                  </Paragraph>
                  <Space>
                    <Button
                      icon={<ShareAltOutlined />}
                      onClick={() => shareOrder(order)}
                    >
                      Поделиться
                    </Button>
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => {
                        const url = `${window.location.origin}/orders/${order.id}`;
                        navigator.clipboard.writeText(url);
                        message.success("Ссылка скопирована");
                      }}
                    >
                      Скопировать
                    </Button>
                  </Space>

                  <DeliveryTrack status={order.status} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrders;
