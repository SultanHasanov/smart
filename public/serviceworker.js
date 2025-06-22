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
  event.waitUntil(self.clients.claim());
});

// Обработка fetch запросов к API
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
  }
});

// 👇👇👇 ДОБАВЛЯЕМ ОБРАБОТКУ PUSH 👇👇👇
// self.addEventListener('push', function(event) {
//   let data = {};

//   if (event.data) {
//     try {
//       data = event.data.json();
//     } catch (e) {
//       data = { title: 'Уведомление', body: event.data.text() };
//     }
//   } else {
//     // Если данные не пришли вообще
//     data = { title: 'Уведомление', body: 'Пустое уведомление' };
//   }

//   const title = data.title || 'Уведомление';
//   const options = {
//     body: data.body || 'У вас новое уведомление',
//   };

//   event.waitUntil(
//     self.registration.showNotification(title, options)
//   );
// });

// self.addEventListener('push', function (event) {
//   let data = {};
//   try {
//     data = event.data.json();
//   } catch (e) {
//     console.warn('⚠️ Push пришёл не в JSON-формате:', event.data?.text());
//     data = { title: 'Сообщение', body: event.data?.text() || 'Без содержимого' };
//   }

//   const title = data.title || 'Уведомление';
//   const options = {
//     body: data.body,
//   };

//   event.waitUntil(
//     self.registration.showNotification(title, options)
//   );
// });

self.addEventListener("push", function (event) {
   console.log('[Service Worker] Push received:', event);
  console.log('[Service Worker] Data:', event.data?.text());
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    console.warn("⚠️ Push пришёл не в JSON-формате:", event.data?.text());
    data = {
      title: "Сообщение",
      body: event.data?.text() || "Без содержимого",
    };
  }

  const title = data.title || "Уведомление";
  const options = {
    body: data.body,
    icon: "/apple-touch-icon.png",
    badge: "/favicon-96x96.png",
    data: {
      url: data.url || "/", // передаём url для перехода при клике
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Обработчик клика по уведомлению
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
