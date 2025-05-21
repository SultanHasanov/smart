import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeFilled,
  AppstoreAddOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  LoginOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../store/AuthContext';

// Компонент TabIcons с использованием useEffect для отслеживания изменений в localStorage
const TabIcons = () => {
   const { token, userRole } = useContext(AuthContext);
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
            to: '/favorites',
            icon: PlusOutlined,
            label: 'Товар',
          },
        ]
      : []),
     ...(userRole === 'user'
      ? [
          {
            to: '/orders',
            icon: ShoppingOutlined,
            label: 'Заказы',
          },
        ]
      : []),
    {
      to: '/login',
      icon: LoginOutlined,
      label: token ? 'Выйти' : 'Войти',
    },
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
