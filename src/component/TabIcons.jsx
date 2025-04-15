// TabIcons.jsx
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeFilled,
  AppstoreAddOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  LoginOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const TABS = [
  {
    to: '/',
    icon: HomeFilled,
    label: 'Главная',
    exact: true,
  },
  {
    to: '/catalog',
    icon: AppstoreAddOutlined,
    label: 'Каталог',
  },
  {
    to: '/cart',
    icon: ShoppingCartOutlined,
    label: 'Корзина',
  },
  {
    to: '/favorites',
    icon: PlusOutlined,
    label: 'Товар',
  },
  {
    to: '/login', // Изменим метку, если пользователь авторизован
    icon: LoginOutlined,
    label: 'Войти',
  },
];

const TabIcons = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedImageUrl = localStorage.getItem('uploadedImageUrl');
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
    }

    // Проверяем, есть ли токен, и если есть, считаем пользователя авторизованным
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Если пользователь авторизован, меняем метку с "Войти" на "Профиль"
  TABS[4].label = isAuthenticated ? 'Профиль' : 'Войти';

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
          {to === '/login' && imageUrl ? (
            // Если у нас есть изображение, отображаем его
            <img
              src={imageUrl}
              alt="User Avatar"
              style={styles.roundedIcon}
            />
          ) : (
            <Icon
              style={{
                ...styles.icon,
                color: undefined, // inherit from parent
              }}
            />
          )}
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
  roundedIcon: {
    width: '27px', // Размер изображения
    height: '27px', // Размер изображения
    borderRadius: '50%', // Округление
    objectFit: 'cover', // Чтобы изображение не искажалось
  },
  label: {
    fontSize: '12px',
  },
};

export default TabIcons;
