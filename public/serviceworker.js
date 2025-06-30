const API_URLS = [
  "https://chechnya-product.ru/api/products",
  "https://chechnya-product.ru/api/categories",
];

// Установка воркера — ничего не кэшируем
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Активация воркера
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Все запросы — напрямую, без кэша
self.addEventListener("fetch", (event) => {
  if (API_URLS.some((url) => event.request.url.includes(url))) {
    event.respondWith(fetch(event.request));
  }
});

// Push-уведомления
self.addEventListener("push", function (event) {
  event.waitUntil(
    (async () => {
      let data = { title: "Уведомление", body: "📦 Новый заказ" };

      if (event.data) {
        try {
          data = event.data.json();
        } catch {
          const text = await event.data.text();
          data.body = text;
        }
      }

      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/apple-touch-icon.png",
        badge: "/icon-48x48.png",
        data: { url: "/admin-orders" },
      });
    })()
  );
});

// Обработка клика по уведомлению
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
