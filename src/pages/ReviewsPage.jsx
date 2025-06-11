
import React, { useEffect, useState } from "react";
import { List, Typography, Rate, Card, Spin, message } from "antd";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const formatDate = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString("ru-RU", { timeZone: "UTC" });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "https://chechnya-product.ru/api/order-reviews",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const allOrders = response.data.data;

        // Фильтруем только те, где есть отзыв
        const ordersWithReviews = allOrders.filter(
          (order) => order.rating != null
        );

        setReviews(ordersWithReviews);
      } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
        message.error("Не удалось загрузить отзывы");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div style={{ marginBottom: 75 }}>
      <Title level={2}>Отзывы пользователей</Title>

      {loading ? (
        <Spin size="large" />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={reviews}
          renderItem={(order) => (
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {order.username || "Гость"}
                </Title>
                <Rate disabled defaultValue={order.rating} />
              </div>
              <Paragraph style={{ marginTop: "12px", fontSize: "15px" }}>
                {order.comment || "Без комментариев"}
              </Paragraph>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                ID заказа: {order.id}
              </Text>
              <Paragraph>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Дата: {formatDate(order.created_at)}
                </Text>
              </Paragraph>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
