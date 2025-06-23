import React, { useContext, useEffect, useState } from "react";
import { Button } from "antd";
import { AuthContext } from "./store/AuthContext";
import { FaBell, FaBellSlash } from "react-icons/fa";

const PUBLIC_VAPID_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeUser() {
  const reg = await navigator.serviceWorker.ready;
  return await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });
}

const PushSender = () => {
  const { userRole } = useContext(AuthContext);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pushSubscription");
    if (stored) setIsSubscribed(true);
  }, []);

  const handleSubscribe = async () => {
    try {
      const subscription = await subscribeUser();
      localStorage.setItem("pushSubscription", JSON.stringify(subscription));

      await fetch("https://chechnya-product.ru/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          is_admin: userRole === "admin",
        }),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error("Ошибка подписки:", error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      const subscription = await subscribeUser();

      await fetch("https://chechnya-product.ru/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          is_admin: false,
        }),
      });

      localStorage.removeItem("pushSubscription");
      setIsSubscribed(false);
    } catch (error) {
      console.error("Ошибка отписки:", error);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 15 }}>
      <Button
        type="text"
        shape="circle"
        icon={isSubscribed ? (
          <FaBellSlash style={{ 
            fontSize: 20, 
            color: '#ff4d4f',
            transition: 'all 0.3s'
          }} />
        ) : (
          <FaBell style={{ 
            fontSize: 20, 
            color: '#1890ff',
            transition: 'all 0.3s'
          }} />
        )}
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        style={{
          border: 'none',
          boxShadow: 'none',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent'
        }}
      />
      <span style={{ 
        fontSize: 14,
        color: isSubscribed ? '#ff4d4f' : '#1890ff',
        transition: 'all 0.3s',
        cursor: 'pointer'
      }} onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}>
        {isSubscribed ? 'Отписаться от уведомлений' : 'Подписаться на уведомления'}
      </span>
    </div>
  );
};

export default PushSender;