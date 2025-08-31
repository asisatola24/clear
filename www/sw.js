self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('clearance-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/logo.svg'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'clearance-cache-v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch latest in background and update cache
        event.waitUntil(
          fetch(event.request).then((response) => {
            return caches.open('clearance-cache-v1').then((cache) => {
              cache.put(event.request, response.clone());
            });
          })
        );
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
