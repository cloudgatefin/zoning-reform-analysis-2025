// Service Worker for Zoning Reform Dashboard
// Provides offline support and caching for PWA functionality

const CACHE_NAME = 'zoning-dashboard-v1';
const RUNTIME_CACHE = 'zoning-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './js/main.js',
  './data/reform_impact_metrics.csv',
  './data/reform_timeseries.csv',
  './map/states-10m.json',
  './manifest.json'
];

// External CDN assets
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/d3@7',
  'https://cdn.jsdelivr.net/npm/topojson-client@3',
  'https://cdn.jsdelivr.net/npm/chart.js@4'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Cache CDN assets separately (they may fail, so we handle them individually)
        return caches.open(RUNTIME_CACHE);
      })
      .then((cache) => {
        console.log('[Service Worker] Caching CDN assets');
        return Promise.allSettled(
          CDN_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== CACHE_NAME && name !== RUNTIME_CACHE;
            })
            .map((name) => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests that aren't CDN assets
  if (url.origin !== location.origin && !CDN_ASSETS.some(cdn => request.url.includes(cdn))) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', request.url);
          return cachedResponse;
        }

        // Network-first strategy for data files to get fresh data
        if (request.url.includes('/data/')) {
          return fetch(request)
            .then((response) => {
              // Clone the response
              const responseToCache = response.clone();

              // Cache the fetched response
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch((error) => {
              console.warn('[Service Worker] Network fetch failed, returning cached version:', error);
              return caches.match(request);
            });
        }

        // Cache-first for everything else
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);

            // Return offline page or cached version
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }

                // Return a basic offline response
                return new Response('Offline - content not available', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain'
                  })
                });
              });
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Background sync for future enhancements
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Fetch fresh data when connection is restored
      fetch('./data/reform_impact_metrics.csv')
        .then(response => response.text())
        .then(() => {
          console.log('[Service Worker] Data synced successfully');
        })
        .catch((error) => {
          console.error('[Service Worker] Sync failed:', error);
        })
    );
  }
});

// Push notification support (for future enhancements)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New zoning reform data available',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Dashboard'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Zoning Reform Dashboard', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});
