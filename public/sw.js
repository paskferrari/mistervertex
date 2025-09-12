const CACHE_NAME = 'mister-vertex-v1';
const STATIC_CACHE_NAME = 'mister-vertex-static-v1';
const DYNAMIC_CACHE_NAME = 'mister-vertex-dynamic-v1';

// File da cachare immediatamente
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logoVertex.png',
  '/avatarOnBoarding.png',
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/globals.css'
];

// Pagine da cachare per l'accesso offline
const OFFLINE_PAGES = [
  '/',
  '/welcome',
  '/login',
  '/dashboard',
  '/xbank'
];

// Installazione del service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
});

// Attivazione del service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Strategia di caching per le richieste
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora le richieste non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignora le richieste API di Supabase
  if (url.hostname.includes('supabase')) {
    return;
  }
  
  // Strategia Cache First per le risorse statiche
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      url.pathname.startsWith('/_next/static/')) {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
        .catch(() => {
          // Fallback per immagini
          if (request.destination === 'image') {
            return caches.match('/logoVertex.png');
          }
        })
    );
    return;
  }
  
  // Strategia Network First per le pagine
  if (request.destination === 'document' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback alla cache per le pagine offline
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Fallback alla homepage se la pagina non è in cache
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // Strategia Cache First per tutto il resto
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          });
      })
      .catch(() => {
        // Fallback generico
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Gestione dei messaggi dal client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Notifica di aggiornamento disponibile
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Logica per verificare aggiornamenti
    event.ports[0].postMessage({ hasUpdate: false });
  }
});

// Background sync per le richieste fallite
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Implementa la logica di sincronizzazione
  }
});

// Push notifications (per future implementazioni)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nuova notifica da Mister Vertex',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Apri App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Mister Vertex', options)
  );
});

// Gestione click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});