// Change this version number EVERY TIME you update your website!
const CACHE_NAME = 'shaketohome-v5'; 

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
  // Add any local images or icons here if you have them, like '/icon-192.png'
];

// 1. Install Event - Caches the new files
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate Event - Clears out the OLD cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If the cache name doesn't match our current version, delete it!
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - "Network First, falling back to cache" Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If we have internet, get the newest files from GitHub and save them
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET') {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // If the user is offline, load the saved version from the cache
        return caches.match(event.request);
      })
  );
});
