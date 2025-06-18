const publicKey = "BFSKzykmheDBQvkFXHd_016RzmAwZLkWz7qHx7n_u-5IgxMTQfG1vIyQdk_p19Y4xAgo-N_3W0BYEyfvBVxy8rU"; 

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeUser() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const reg = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();

  if (permission !== "granted") return;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const payload = {
    endpoint: sub.endpoint,
    auth: btoa(
      String.fromCharCode(...new Uint8Array(sub.getKeys().get("auth")))
    ),
    p256dh: btoa(
      String.fromCharCode(...new Uint8Array(sub.getKeys().get("p256dh")))
    ),
  };

  // Отправляем на ваш бекенд
  await fetch("https://chechnya-product.ru/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
