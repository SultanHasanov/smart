import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Typography,
  Spin,
  Alert,
  Tag,
  Button,
  message,
  Space,
  Popconfirm,
  Rate,
  Input,
} from "antd";
import {
  CloseCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../component/styles/Product.scss"; // тот же стиль, что у OrderManager
import { DateTime } from "luxon";
import CartStore from "../store/CartStore";

const { Text, Paragraph } = Typography;
const WS_URL = "wss://chechnya-product.ru/ws/orders";
const ORDER_API = "https://chechnya-product.ru/api/orders";

const statusFlow = ["новый", "принят", "собирается", "в пути", "доставлен"];

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

const DeliveryTrack = ({ status }) => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const positionByStatus = {
      новый: 0,
      принят: 22.5,
      собирается: 45,
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
  const [dataReview, setDataReview] = useState([])
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const toggleOrderDetails = async (id) => {
  if (expandedOrder === id) {
    setExpandedOrder(null);
    return;
  }

  setExpandedOrder(id);
  console.log(dataReview.comment)

  const fetchReview = async (orderId) => {
   try {
     const response = await axios.get(
       `https://chechnya-product.ru/api/orders/${orderId}/review`,
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );
     setDataReview(response.data.data)

   } catch (err) {
     console.error("Ошибка при получении отзыва:", err);
     
   }
  };
  // Загружаем отзыв только если статус доставлен
  const order = orders.find((o) => o.id === id);
  if (order && order.status === "доставлен" && (order.rating === null || order.comment === null)) {
    const review = await fetchReview(id);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              rating: review?.rating ?? null,
              comment: review?.comment ?? "",
              reviewText: review?.comment ?? "",
            }
          : o
      )
    );
  }
};

  const formatDate = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString("ru-RU", { timeZone: "UTC" });
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
        setOrders(
          (response.data.data || []).map((order) => ({
            ...order,
            reviewText: order.comment ?? "", // сохраняем локально
          }))
        );
      } catch (err) {
        console.error("Ошибка получения заказов:", err);
        setError("Не удалось загрузить заказы. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };
    
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
}, [token, userRole]);

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
if (userRole !== "user") {
  return (
    <Alert
        type="info"
        message="Только авторизованные пользователи могут видеть свои заказы."
        />
      );
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
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Typography.Title level={3}>Мои заказы</Typography.Title>
      <div className="order-list">
        {orders.map((order) => {
          const itemList = order.items?.map((item) => (
            <li key={item.id}>
              {item.name} x{item.quantity} = {item.price * item.quantity}₽
            </li>
          ));

          return (
            <div key={order.id} className={`order-item`}>
              <div
                className="order-summary"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <Space className="order-label">
                  <Text strong style={{ color: "#1890ff" }}>
                    #{order.id}
                  </Text>

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
                    <Text strong>Сумма:</Text> {order.total}
                  </Paragraph>
                  {order.order_comment && (
                    <Paragraph>
                      <Text strong>Комментарий:</Text> {order.order_comment}
                    </Paragraph>
                  )}

                  <Space
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
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
                    {order.status === "доставлен" && (
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
                    )}
                    {["новый", "принят"].includes(order.status) && (
                      <Popconfirm
                        description={`Можно отменить до статуса "собирается"`}
                        title="Хотите отменить заказ?"
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
                          <span style={{ fontSize: 12 }}>Отменить</span>
                        </div>
                      </Popconfirm>
                    )}
                  </Space>

                  <DeliveryTrack status={order.status} />
                  {/* {order.status === "доставлен" && (
                    <div style={{ marginTop: 16 }}>
                      {order.rating === null || order.comment === null ? (
                        <>
                          <Typography.Title level={4}>
                            Оцените заказ
                          </Typography.Title>

                          <div style={{ marginBottom: 12 }}>
                            <Text strong>Оценка:</Text>
                            <Rate
                              allowClear
                              value={order.rating}
                              onChange={(value) => {
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o.id === order.id
                                      ? { ...o, rating: value }
                                      : o
                                  )
                                );
                              }}
                            />
                          </div>

                          <div style={{ marginBottom: 12 }}>
                            <Text strong>Комментарий:</Text>
                            <Input.TextArea
                              rows={4}
                              maxLength={300}
                              showCount
                              value={order.reviewText || ""}
                              onChange={(e) => {
                                const text = e.target.value;
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o.id === order.id
                                      ? { ...o, reviewText: text }
                                      : o
                                  )
                                );
                              }}
                              placeholder="Расскажите, как всё прошло"
                            />
                          </div>

                          <Button
                            type="primary"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("token");
                                await axios.patch(
                                  `https://chechnya-product.ru/api/orders/${order.id}/review`,
                                  {
                                    rating: order.rating || 0,
                                    comment: order.reviewText || "",
                                  },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                message.success("Спасибо за отзыв!");

                                // обновляем order.comment и rating
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o.id === order.id
                                      ? {
                                          ...o,
                                          comment: o.reviewText,
                                          rating: o.rating,
                                        }
                                      : o
                                  )
                                );
                              } catch (err) {
                                console.error("Ошибка отправки отзыва:", err);
                                message.error("Не удалось отправить отзыв");
                              }
                            }}
                            disabled={!order.rating}
                          >
                            Отправить отзыв
                          </Button>
                        </>
                      ) : (
                        <div style={{ marginTop: 16 }}>
                          <Typography.Title level={4}>
                            Ваш отзыв
                          </Typography.Title>
                          <Rate disabled defaultValue={dataReview.rating} />
                          <Typography.Paragraph style={{ marginTop: 8 }}>
                            {dataReview.comment || "Без комментариев"}
                          </Typography.Paragraph>
                        </div>
                      )}
                    </div>
                  )} */}
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
