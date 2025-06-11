import React, { useState, useEffect, useContext, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeFilled,
  AppstoreAddOutlined,
  ShoppingCartOutlined,
 
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { AuthContext } from '../store/AuthContext';
import axios from 'axios';
import { Avatar } from 'antd';
const WS_URL = "wss://chechnya-product.ru/ws/orders";
// Компонент TabIcons с использованием useEffect для отслеживания изменений в localStorage
const TabIcons = () => {
   const { token, userRole, userId } = useContext(AuthContext);
 const [orders, setOrders] = useState([]);
  const newOrdersCount = orders.filter(order => order.status === "новый").length;
  const wsRef = useRef(null);
  console.log(newOrdersCount)
 useEffect(() => {
  if (!token || (userRole !== "user" && userRole !== "admin")) return;

  const fetchOrders = async () => {
    try {
      const url =
        userRole === "admin"
          ? "https://chechnya-product.ru/api/admin/orders"
          : "https://chechnya-product.ru/api/orders";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.data || []);
    } catch (err) {
      console.error("Ошибка получения заказов:", err);
    }
  };

  fetchOrders();

  const socket = new WebSocket(WS_URL);
  wsRef.current = socket;

  socket.onopen = () => console.log("✅ WebSocket подключён");
  socket.onerror = (err) => console.error("❌ WebSocket ошибка:", err);
  socket.onclose = () => console.warn("⚠ WebSocket закрыт");

  socket.onmessage = (event) => {
    try {
      const messageData = JSON.parse(event.data);
      if (
        messageData.type === "new_order" ||
        messageData.type === "status_update"
      ) {
        const incoming = messageData.order;

        // Пользователь видит только свои заказы, админ — все
        if (userRole === "user" && incoming.user_id !== userId) return;

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
}, [token, userRole, userId]);


  // Обновляем список вкладок с условной проверкой для вкладки Товар
  const TABS = [
    {
      to: '/',
      icon: HomeFilled,
      label: 'Главная',
      exact: true,
    },
    {
      to: '/category',
      icon: AppstoreAddOutlined,
      label: 'Каталог',
    },
    {
      to: '/cart',
      icon: ShoppingCartOutlined,
      label: 'Корзина',
    },
    ...(userRole === 'admin'
      ? [
          {
            to: '/admin-orders',
            icon: ShoppingOutlined,
            label: (
          <div style={{ position: 'relative' }}>
            Заказы
            {newOrdersCount !== 0  && (
              <span
                style={{
                  position: 'absolute',
                  top: -32,
                  right: -12,
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 5px',
                  fontSize: 10,
                  lineHeight: '12px',
                  fontWeight: "bold"
                }}
              >
                {newOrdersCount}
              </span>
            )}
          </div>
        ),
          },
        ]
      : []),
     ...(userRole === 'user'
      ? [
          {
        to: '/orders',
        icon: ShoppingOutlined,
        label: (
          <div style={{ position: 'relative' }}>
            Заказы
            {newOrdersCount !== 0  && (
              <span
                style={{
                  position: 'absolute',
                  top: -32,
                  right: -12,
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 5px',
                  fontSize: 10,
                  lineHeight: '12px',
                  fontWeight: "bold"
                }}
              >
                {newOrdersCount}
              </span>
            )}
          </div>
        ),
      },
        ]
      : []),
   {
  to: '/login',
  icon: UserOutlined ,
  label: "Профиль",
}

  ];

  return (
    <div style={styles.tabBar}>
      {TABS.map(({ to, icon: Icon, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          style={({ isActive }) => ({
            ...styles.tab,
            color: isActive ? '#00b96b' : '#000',
          })}
        >
          <Icon
            style={{
              ...styles.icon,
              color: undefined, // inherit from parent
            }}
          />
          <span style={styles.label}>{label}</span>
        </NavLink>
      ))}
    </div>
  );
};

const styles = {
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: '#fff',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '12px',
    textDecoration: 'none',
    transition: 'color 0.2s ease-in-out',
  },
  icon: {
    fontSize: '20px',
    marginBottom: '4px',
  },
  label: {
    fontSize: '12px',
  },
};

export default TabIcons;
