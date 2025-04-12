// components/TabIcons.jsx
import React from "react";
import { Tabs } from "antd";
import {
  ShopOutlined,

  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css"; // Import your CSS file for styling
const { TabPane } = Tabs;

const TabIcons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToKey = {
    "/": "1",
    "/booking": "2",
    "/admin": "3",
  };

  const keyToPath = {
    1: "/",
    2: "/booking",
    3: "/admin",
  };

  const activeKey = pathToKey[location.pathname] || "1";

  const handleTabChange = (key) => {
    navigate(keyToPath[key]);
  };

  return (
    <div style={{ paddingBottom: 64 }}>
    <div
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          background: "#fff",
          borderTop: "1px solid #eee",
          zIndex: 1000
        }}
      >
    <Tabs
    
      activeKey={activeKey}
      onChange={handleTabChange}
      centered
      tabPosition="bottom"
       className="bottom-tabs"
    >
      <TabPane
        tab={
          <span>
            <ShopOutlined />
            Продукты
          </span>
        }
        key="1"
      />
      <TabPane
        tab={
          <span>
            <ShoppingCartOutlined />
            Корзина
          </span>
        }
        key="2"
      />
      <TabPane
        tab={
          <span>
            <UserOutlined />
            Профиль
          </span>
        }
        key="3"
      />
    </Tabs>
  </div>
  </div>
  );
};

export default TabIcons;
