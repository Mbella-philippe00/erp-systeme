const CACHE_NAME = 'erp-mobile-v1';

// Ressources à mettre en cache pour le fonctionnement hors ligne
const STATIC_RESOURCES = [
  '/mobile',
  '/mobile/pointage',
  '/mobile/conges',
  '/mobile/documents',
  '/mobile/messages',
  '/mobile/calendrier',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/pointage.png',
  '/icons/conges.png'
];

// Routes API à mettre en cache avec stratégie stale-while-revalidate
const API_ROUTES = [
  '/api/mobile/user-profile',
  '/api/mobile/timesheet',
  '/api/mobile/leave-requests',
  '/api/mobile/documents',
  '/api/mobile/messages',
  '/api/mobile/calendar'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_RESOURCES);
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Stratégie de mise en cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Stratégie pour les ressources statiques
  if (STATIC_RESOURCES.includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Stratégie pour les routes API
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Stratégie par défaut
  event.respondWith(networkFirst(event.request));
});

// Stratégie Cache First
async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

// Stratégie Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Hors ligne - Contenu non disponible', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cached || fetchPromise;
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion du clic sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-timesheet') {
    event.waitUntil(syncTimesheet());
  } else if (event.tag === 'sync-leave-requests') {
    event.waitUntil(syncLeaveRequests());
  }
});

// Fonction de synchronisation des pointages
async function syncTimesheet() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  const timesheetRequests = requests.filter(request => 
    request.url.includes('/api/mobile/timesheet')
  );

  return Promise.all(
    timesheetRequests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Erreur de synchronisation:', error);
      }
    })
  );
}

// Fonction de synchronisation des demandes de congés
async function syncLeaveRequests() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  const leaveRequests = requests.filter(request => 
    request.url.includes('/api/mobile/leave-requests')
  );

  return Promise.all(
    leaveRequests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Erreur de synchronisation:', error);
      }
    })
  );
}