// TabIcons.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeFilled,
  AppstoreAddOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  LoginOutlined,
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
    icon: HeartOutlined,
    label: 'Избранное',
  },
  {
    to: '/login',
    icon: LoginOutlined,
    label: 'Войти',
  },
];

const TabIcons = () => {
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
