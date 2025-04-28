const CACHE_NAME = 'dishes-cache-v1';
const API_URLS = [
  'https://chechnya-product.ru/api/products',
  'https://chechnya-product.ru/api/categories'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(API_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (API_URLS.some(url => event.request.url.includes(url))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Возвращаем кешированные данные, если есть
          if (response) return response;
          
          // Если нет в кеше, делаем запрос к сети
          return fetch(event.request)
            .then(response => {
              // Кешируем новый ответ
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
              return response;
            });
        })
    );
  }
});