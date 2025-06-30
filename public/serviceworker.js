const CACHE_NAME = "dishes-cache-v1";
const API_URLS = [
  "https://chechnya-product.ru/api/products",
  "https://chechnya-product.ru/api/categories",
];

// Кэширование при установке
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(API_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активация воркера
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (API_URLS.some((url) => event.request.url.includes(url))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;

        return fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
          return response;
        });
      })
    );
  } else {
    // For all other requests, optional: do a network-first or cache-first strategy
    event.respondWith(
      caches.match(event.request).then((cacheResponse) => {
        return (
          cacheResponse ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  }
});


self.addEventListener("push", function (event) {
  event.waitUntil(
    (async () => {
      let data = { title: "Уведомление", body: "📦 Новый заказ" };

      if (event.data) {
        try {
          data = event.data.json();
        } catch {
          const text = await event.data.text(); // ✅ await, т.к. text() — Promise
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

// 👇 Обработка клика по уведомлению
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
