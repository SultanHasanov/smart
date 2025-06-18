const CACHE_NAME = 'dishes-cache-v1';
const API_URLS = [
  'https://chechnya-product.ru/api/products',
  'https://chechnya-product.ru/api/categories'
];

// Кэширование при установке
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(API_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активация воркера
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Обработка fetch запросов к API
self.addEventListener('fetch', (event) => {
  if (API_URLS.some(url => event.request.url.includes(url))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) return response;

          return fetch(event.request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
              return response;
            });
        })
    );
  }
});

// 👇👇👇 ДОБАВЛЯЕМ ОБРАБОТКУ PUSH 👇👇👇
self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  const title = data.title || 'Уведомление';
  const options = {
    body: data.message || '',
    // icon: '/icons/icon-192x192.png',
    // badge: '/icons/badge-72x72.png',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
