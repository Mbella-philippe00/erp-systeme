// Service Worker pour l'application ERP Mobile

const CACHE_NAME = 'erp-mobile-cache-v1';
const OFFLINE_URL = '/mobile';

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/mobile',
        '/login',
        '/placeholder-logo.svg',
        '/placeholder-user.jpg',
      ]);
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
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

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  // Stratégie network-first pour les API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Stratégie cache-first pour les ressources statiques
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'sync-timesheet') {
    event.waitUntil(syncTimesheet());
  }
});

// Synchronisation des données de pointage
async function syncTimesheet() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction('timesheet', 'readwrite');
    const store = tx.objectStore('timesheet');
    
    // Récupérer tous les pointages non synchronisés
    const unsyncedEntries = await store.getAll();
    
    for (const entry of unsyncedEntries) {
      if (!entry.synced) {
        try {
          // Tenter de synchroniser avec le serveur
          const response = await fetch('/api/mobile/timesheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: entry.type,
              timestamp: entry.timestamp,
              location: entry.location
            }),
          });
          
          if (response.ok) {
            // Marquer comme synchronisé
            entry.synced = true;
            await store.put(entry);
            console.log('Pointage synchronisé avec succès:', entry.timestamp);
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation du pointage:', error);
        }
      }
    }
    
    await tx.complete;
    db.close();
  } catch (error) {
    console.error('Erreur lors de la synchronisation des pointages:', error);
  }
}

// Fonction utilitaire pour ouvrir IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offlineStore', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('timesheet')) {
        db.createObjectStore('timesheet', { keyPath: 'timestamp' });
      }
    };
  });
}