import React, { useEffect, useState } from "react";
import {
  Tag,
  message,
  Typography,
  Spin,
  Space,
  Button,
  Card,
  Divider,
  List,
} from "antd";
import {
  EnvironmentOutlined,
  ShareAltOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import axios from "axios";
import YMap from "./YMap";
import "../component/styles/Product.scss";
import { AuthContext } from "../store/AuthContext";

const { Text, Paragraph } = Typography;

const ORDER_API = "https://chechnya-product.ru/api/admin/orders";

const CourierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { userRole } = React.useContext(AuthContext);
  const [routeInfos, setRouteInfos] = useState({});

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(ORDER_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredOrders = res.data.data.filter(
        (order) =>
          order.status === "собирается" && order.delivery_type === "delivery"
      );
      setOrders(filteredOrders);
    } catch {
      message.error("Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "courier" || userRole === "admin") {
      fetchOrders();
    }
  }, [userRole]);

  const handleRouteInfo = (orderId, info) => {
    setRouteInfos(prev => ({
      ...prev,
      [orderId]: info
    }));
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${"https://chechnya-product.ru/api/orders"}/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Статус обновлён");
      fetchOrders();
      setExpandedOrderId(null);
    } catch {
      message.error("Ошибка обновления статуса");
    }
  };

  const openYandexMaps = (order) => {
    if (!order.address) return;
    const encodedAddress = encodeURIComponent(order.address);
    window.open(`https://yandex.ru/maps/?rtext=~${encodedAddress}&rtt=auto`);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (userRole !== "courier" && userRole !== "admin") {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Text type="danger">Доступ запрещён. Только для курьеров.</Text>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 75 }}>
      <h2>Заказы для доставки</h2>
      <Text type="secondary">
        Здесь отображаются заказы со статусом "собирается"
      </Text>

      <Divider />

      {loading ? (
        <Spin size="large" />
      ) : (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {orders.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={orders}
              renderItem={(order) => (
                <List.Item
                  key={order.id}
                  style={{
                    backgroundColor: "#fff",
                    marginBottom: 6,
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div>
                      <Text strong>Заказ #{order.id}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="purple">{order.status}</Tag>
                        <Text style={{ marginLeft: 8 }}>{order.name}</Text>
                      </div>
                    </div>
                    <div>
                      <Text strong style={{ marginRight: 16 }}>
                        {order.total}₽
                      </Text>
                      {expandedOrderId === order.id ? (
                        <UpOutlined />
                      ) : (
                        <DownOutlined />
                      )}
                    </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div style={{ }}>
                      <Paragraph style={{ marginTop: 16 }}>
                        <EnvironmentOutlined /> {order.address}
                      </Paragraph>

                      {/* Мини-карта с маршрутом */}
                      <div style={{ height: 200, marginBottom: 16 }}>
                        <YMap
                          from="Чеченская Респ, Ачхой-Мартановский р-н, село Давыденко, ул Кооперативная, двлд 93"
                          to={order.address}
                          onRouteInfo={(info) => handleRouteInfo(order.id, info)}
                        />
                      </div>

                      {/* Информация о маршруте */}
                      <Space direction="vertical" style={{ width: "100%", marginTop: 16  }}>
                        <Text strong>Информация о маршруте:</Text>
                        <div>
                          Расстояние: {routeInfos[order.id]?.car?.distance || '...'} 
                        </div>
                        <div>
                          Время: {routeInfos[order.id]?.car?.time || '...'}
                        </div>
                      </Space>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: 16,
                        }}
                      >
                        {/* <Button
                          type="primary"
                          onClick={() => updateOrderStatus(order.id, "в пути")}
                        >
                          Взять в доставку
                        </Button> */}
                        <Button
                          icon={<ShareAltOutlined />}
                          onClick={() => openYandexMaps(order)}
                        >
                          Открыть в Яндекс Картах
                        </Button>
                      </div>
                    </div>
                  )}
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: "center", width: "100%", padding: 24 }}>
              <Text type="secondary">Нет заказов для доставки</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourierOrders;