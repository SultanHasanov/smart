import React, { useEffect, useState, useRef } from "react";
import { Tag, message, Typography, Spin, Popconfirm, Space } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./styles/Product.scss";
import { useNavigate } from "react-router-dom";
import CartStore from "../store/CartStore";

const { Text, Paragraph } = Typography;

const ORDER_API = "https://chechnya-product.ru/api/admin/orders";
const WS_URL = "wss://chechnya-product.ru/ws/orders";

const statusFlow = ["новый", "принят", "в обработке", "в пути", "доставлен"];

const getNextStatus = (current) => {
  const idx = statusFlow.indexOf(current);
  return idx >= 0 && idx < statusFlow.length - 1
    ? statusFlow[idx + 1]
    : current;
};

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

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const refs = useRef({});
  const wsRef = useRef(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(ORDER_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch {
      message.error("Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${ORDER_API}/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Статус обновлён");
      fetchOrders();
    } catch {
      message.error("Ошибка обновления статуса");
    }
  };

  const handleTagClick = (order) => {
    const next = getNextStatus(order.status);
    if (next !== order.status) {
      updateOrderStatus(order.id, next);
    }
  };

  const formatDate = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString("ru-RU");
  };

  const shareOrder = async (order) => {
    try {
      const shareUrl = `${window.location.origin}/orders/${order.id}`;
      const title = `Заказ от ${order.name}`;

      if (navigator.share) {
        await navigator.share({
          title,
          text: `Посмотри заказ ${order.name}`,
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
    fetchOrders();

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
          setOrders((prevOrders) => {
            const exists = prevOrders.find((o) => o.id === incoming.id);
            if (exists) {
              return prevOrders.map((o) =>
                o.id === incoming.id ? { ...o, ...incoming } : o
              );
            } else {
              return [incoming, ...prevOrders];
            }
          });
        }
      } catch (e) {
        console.error("Ошибка обработки WebSocket-сообщения:", e);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
      console.log(positionByStatus[status]);
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

  return (
    <>
      <h3>Управление заказами</h3>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const itemList = order.items?.map((item) => (
              <li key={item.id}>
                {item.name} x{item.quantity} = {item.price * item.quantity}₽
              </li>
            ));

            return (
              <div key={order.id} className="order-item">
                <div
                  className="order-summary"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <Space className="order-label">
                    <Text strong>{order.name}</Text>
                    <Tag
                      color={getStatusColor(order.status)}
                      onClick={() => handleTagClick(order)}
                      style={{ cursor: "pointer" }}
                    >
                      {order.status}
                    </Tag>
                  </Space>
                </div>
                {expandedOrder === order.id && (
                  <div
                    className="order-details"
                    ref={(el) => (refs.current[order.id] = el)}
                  >
                    <Paragraph className="order-label">
                      <Text strong>Заказ от: {order.name}</Text>
                      <Tag
                        color={getStatusColor(order.status)}
                        onClick={() => handleTagClick(order)}
                        style={{ cursor: "pointer", marginLeft: 10 }}
                      >
                        {order.status}
                      </Tag>
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Дата:</Text> {formatDate(order.date_orders)}
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

                    <Space
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="icon_action">
                        <CheckCircleOutlined
                          style={{ fontSize: 20, color: "green" }}
                          onClick={() => updateOrderStatus(order.id, "готов")}
                        />
                        <span style={{ fontSize: 12, color: "green" }}>
                          Готов
                        </span>
                      </div>
                      <Popconfirm
                        title="Отклонить заказ?"
                        onConfirm={() =>
                          updateOrderStatus(order.id, "отклонен")
                        }
                        okText="Да"
                        cancelText="Нет"
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: "none",
                            backgroundColor: "transparent",
                            height: 42,
                            color: "red",
                          }}
                        >
                          <CloseCircleOutlined style={{ fontSize: 20 }} />
                          <span style={{ fontSize: 12 }}>Отклонить</span>
                        </div>
                      </Popconfirm>
                      <div
                        onClick={() => shareOrder(order)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          border: "none",
                          backgroundColor: "transparent",
                          height: 42,
                          justifyContent: "space-between",
                        }}
                      >
                        <ShareAltOutlined
                          style={{ fontSize: 20, color: "#1890ff" }}
                        />
                        <span style={{ fontSize: 12, color: "#1890ff" }}>
                          Поделиться
                        </span>
                      </div>
                      <div
                        onClick={() => {
                          const url = `${window.location.origin}/orders/${order.id}`;
                          navigator.clipboard.writeText(url);
                          message.success("Ссылка скопирована");
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          border: "none",
                          backgroundColor: "transparent",
                          justifyContent: "space-between",
                          height: 42,
                        }}
                      >
                        <CopyOutlined
                          style={{ fontSize: 20, color: "#1890ff" }}
                        />
                        <span style={{ fontSize: 12, color: "#1890ff" }}>
                          Скопировать
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          border: "none",
                          backgroundColor: "transparent",
                          justifyContent: "space-between",
                          height: 42,
                        }}
                        onClick={() => {
                          CartStore.repeatOrder(order.items); // order.items — список продуктов
                          message.success("Товары добавлены в корзину");
                          navigate("/cart");
                        }}
                      >
                        <ReloadOutlined
                          style={{ fontSize: 20, color: "#1890ff" }}
                        />
                        <span style={{ fontSize: 12, color: "#1890ff" }}>
                          Повторить
                        </span>
                      </div>
                    </Space>

                    <DeliveryTrack key={order.id} status={order.status} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default OrderManager;
