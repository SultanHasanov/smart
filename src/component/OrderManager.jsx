import React, { useEffect, useState, useRef } from "react";
import {
  Collapse,
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
const { Panel } = Collapse;

const ORDER_API = "https://44899c88203381ec.mokky.dev/orders";

const getStatusColor = (status) => {
  switch (status) {
    case "новый":
      return "orange";
    case "выполнен":
      return "green";
    case "отменен":
      return "red";
    default:
      return "default";
  }
};

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const refs = useRef({}); // объект с ключами по id заказов

console.log({ orders });

  const fetchOrders = async () => {
    try {
      const res = await axios.get(ORDER_API);
      setOrders(res.data.reverse());
    } catch (err) {
      message.error("Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${ORDER_API}/${id}`, { status: newStatus });
      message.success("Статус обновлён");
      fetchOrders();
    } catch (err) {
      message.error("Ошибка обновления");
    }
  };

  const shareOrder = async (order, el) => {
    if (!el) return message.error("Карточка не найдена");

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
      });

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

  return (
    <div>
      <h3>Управление заказами</h3>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Collapse
          accordion
          items={orders.map((order) => {
            const itemList = order.items.map((item) => (
              <li key={item.id}>
                {item.name} x{item.quantity} = {item.price * item.quantity}₽
              </li>
            ));

            const date = new Date(order.createdAt).toLocaleString("ru-RU");

            return {
              key: order.id,
              label: (
                <Space className="order-label">
                  <Text strong>{order.name}</Text>
                  <Tag color={getStatusColor(order.status)}><div>{order.status}</div></Tag>
                </Space>
              ),
              children: (
                <div>
                  <div
                    style={{ padding: 10 }}
                    ref={(el) => {
                      if (el) refs.current[order.id] = el;
                    }}
                  >
                    <Paragraph className="order-label">
                      <Text strong>Заказ от: {order.name}</Text>
                      <Tag color={getStatusColor(order.status)}>
                        <div>{order.status}</div>
                      </Tag>
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Дата:</Text> {date}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Тип:</Text>{" "}
                      {order.deliveryType === "delivery"
                        ? "Доставка"
                        : "Самовывоз"} {order.deliveryFee > 0 && `(+${order.deliveryFee}₽)`}{" "}
                    </Paragraph>
                    {order.deliveryType === "delivery" && (
                      <Paragraph>
                        <Text strong>Адрес:</Text> {order.address}
                      </Paragraph>
                    )}
                    <Paragraph>
                      <Text strong>Оплата:</Text>{" "}
                      {order.paymentType === "transfer"
                        ? "Перевод"
                        : order.paymentType === "cash" && order.changeFor
                        ? `Наличные (сдача с ${order.changeFor}₽)`
                        : "Наличные"}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Товары:</Text>
                      <ul>{itemList}</ul>
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Сумма:</Text> {order.total}₽
                    </Paragraph>
                  </div>

                  <Space
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    {order.status === "новый" && (
                      <>
                        <Button
                          onClick={() =>
                            updateOrderStatus(order.id, "выполнен")
                          }
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            border: "none",
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ fontSize: 20, color: "green" }}
                          />
                          <span style={{ fontSize: 12, color: "green" }}>
                            Выполнен
                          </span>
                        </Button>
                        <Popconfirm
                          title="Отменить заказ?"
                          onConfirm={() =>
                            updateOrderStatus(order.id, "отменен")
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
                            }}
                          >
                            <CloseCircleOutlined style={{ fontSize: 20 }} />
                            <span style={{ fontSize: 12 }}>Отменить</span>
                          </Button>
                        </Popconfirm>
                      </>
                    )}
                    <Button
                      onClick={() => shareOrder(order, refs.current[order.id])}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        border: "none",
                        justifyContent: "center",
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
                </div>
              ),
            };
          })}
        />
      )}
    </div>
  );
};

export default OrderManager;
