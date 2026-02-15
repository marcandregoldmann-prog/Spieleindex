/**
 * Service Worker für Magdeburg Freizeitkarte PWA
 * Ermöglicht Offline-Nutzung der App
 */

const CACHE_NAME = 'magdeburg-freizeit-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    // Leaflet CDN Ressourcen
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    // Marker Icons
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
];

// Installation - Ressourcen cachen
self.addEventListener('install', event => {
    console.log('Service Worker: Installation');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', event => {
    console.log('Service Worker: Aktivierung');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Lösche alten Cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Cache-First-Strategie für statische Ressourcen
// Network-First für Kartenkacheln
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Kartenkacheln (OpenStreetMap) - Network-First
    if (url.hostname.includes('tile.openstreetmap.org')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Kacheln cachen für Offline-Nutzung
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Falls offline, versuche aus Cache zu laden
                    return caches.match(request);
                })
        );
        return;
    }

    // Alle anderen Ressourcen - Cache-First
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Wenn nicht im Cache, hole vom Netzwerk
                return fetch(request)
                    .then(response => {
                        // Prüfe ob gültige Response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone response für Cache
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });

                        return response;
                    })
                    .catch(error => {
                        console.log('Service Worker: Fetch error', error);
                        
                        // Fallback für Offline-Modus
                        return caches.match('./index.html');
                    });
            })
    );
});

// Background Sync (optional, für zukünftige Features)
self.addEventListener('sync', event => {
    console.log('Service Worker: Background Sync', event.tag);
    // Hier könnte man z.B. Daten synchronisieren
});

// Push Notifications (optional, für zukünftige Features)
self.addEventListener('push', event => {
    console.log('Service Worker: Push Notification', event);
    // Hier könnte man Push-Benachrichtigungen verarbeiten
});
