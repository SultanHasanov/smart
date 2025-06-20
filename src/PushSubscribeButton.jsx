import { useEffect, useState } from "react";

const publicKey = "BFSKzykmheDBQvkFXHd_016RzmAwZLkWz7qHx7n_u-5IgxMTQfG1vIyQdk_p19Y4xAgo-N_3W0BYEyfvBVxy8rU"; 

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!("Notification" in window)) {
      setStatus("unsupported");
    } else {
      setStatus(Notification.permission);
    }
  }, []);

  const subscribeUser = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const permission = await Notification.requestPermission();
    setStatus(permission);
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      ...(publicKey && {
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }),
    });

   const payload = {
  endpoint: sub.endpoint,
  auth: btoa(
    String.fromCharCode(...new Uint8Array(sub.getKey("auth")))
  ),
  p256dh: btoa(
    String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")))
  ),
};
const token = localStorage.getItem("token");

// await fetch("https://chechnya-product.ru/api/push/subscribe", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     ...(token && { Authorization: `Bearer ${token}` }),
//   },
//   body: JSON.stringify(payload),
// });


    await fetch("https://chechnya-product.ru/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
       },
      body: JSON.stringify(payload),
    });
  };

  const renderStatus = () => {
    switch (status) {
      case "granted":
        return "✅ Разрешено";
      case "denied":
        return "❌ Запрещено";
      case "default":
        return "⚠️ Не выбрано";
      case "unsupported":
        return "🚫 Не поддерживается";
      default:
        return "⏳ Проверка...";
    }
  };

  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "320px",
      }}
    >
      <p>Статус уведомлений: {renderStatus()}</p>
      {status === "default" && (
        <button
          onClick={subscribeUser}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          🔔 Включить уведомления
        </button>
      )}
      {status === "granted" && <p>Вы подписаны на уведомления 🎉</p>}
    </div>
  );
}
