import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Tag,
  message,
  Typography,
  Spin,
  Popconfirm,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import html2canvas from "html2canvas";
import "./styles/Product.scss";

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

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(ORDER_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
      console.log(res.data.data);
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

  const shareOrder = async (order, el) => {
    if (!el) return message.error("Карточка не найдена");
    try {
      el.style.backgroundColor = "#fff";
      const canvas = await html2canvas(el, {
        backgroundColor: "#fff",
        scale: window.devicePixelRatio || 2,
      });
      el.style.backgroundColor = "";
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      const file = new File([blob], `order-${order.id}.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Заказ от ${order.name}`,
          files: [file],
        });
        message.success("Чек скопирован");
      } else {
        message.warning(
          "Устройство не поддерживает шаринг — изображение скачано."
        );
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `order-${order.id}.png`;
        link.click();
      }
    } catch (error) {
      console.error("Ошибка при создании чека:", error);
      message.error("Не удалось создать чек");
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
  const carRef = useRef(null);
  console.log(position)

  useEffect(() => {
    const stepIndex = statusFlow.indexOf(status);
    const newPosition = (stepIndex / (statusFlow.length - 1)) * 90;
    setPosition(newPosition);
  }, [status]);

  return (
    <div className="delivery-track">
      <div className="track-line">
        {statusFlow.map((step, index) => (
          <div
            key={step}
            className={`track-step ${index <= statusFlow.indexOf(status) ? "completed" : ""}`}
          >
            {step}
          </div>
        ))}
        <div
          ref={carRef}
          className="car-icon"
          style={{
            left: `${position}%`,
          }}
        >
          <span style={{ display: "inline-block", transform: "scaleX(-1)" }}>🚗</span>

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
                      <Button
                        onClick={() => updateOrderStatus(order.id, "готов")}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          border: "none",
                          justifyContent: "center",
                          backgroundColor: "transparent"
                        }}
                      >
                        <CheckCircleOutlined
                          style={{ fontSize: 20, color: "green" }}
                        />
                        <span style={{ fontSize: 12, color: "green" }}>
                          Готов
                        </span>
                      </Button>
                      <Popconfirm
                        title="Отклонить заказ?"
                        onConfirm={() =>
                          updateOrderStatus(order.id, "отклонен")
                        }
                        okText="Да"
                        cancelText="Нет"
                      >
                        <Button
                          danger
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            border: "none",
                            justifyContent: "center",
                            backgroundColor: "transparent"
                          }}
                        >
                          <CloseCircleOutlined style={{ fontSize: 20 }} />
                          <span style={{ fontSize: 12 }}>Отклонить</span>
                        </Button>
                      </Popconfirm>

                      <Button
                        onClick={() =>
                          shareOrder(order, refs.current[order.id])
                        }
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          border: "none",
                          justifyContent: "center",
                          backgroundColor: "transparent"
                        }}
                      >
                        <ShareAltOutlined
                          style={{ fontSize: 20, color: "#1890ff" }}
                        />
                        <span style={{ fontSize: 12, color: "#1890ff" }}>
                          Поделиться
                        </span>
                      </Button>
                    </Space>
                    <DeliveryTrack status={order.status} />
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
