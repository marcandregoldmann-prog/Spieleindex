const CACHE_NAME = 'magdeburg-freizeit-v2';

const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Install – Cache einzeln (statt addAll) damit ein Fehler nicht alles blockiert
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of ASSETS) {
                try {
                    await cache.add(asset);
                } catch (err) {
                    console.warn('Cache-Fehler für:', asset, err);
                }
            }
        })
    );
    self.skipWaiting();
});

// Activate – Alte Caches löschen
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

// Fetch – Strategie: Cache first, network fallback + dynamisches Caching
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Navigations-Requests → index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('./index.html').then(r => r || fetch(event.request))
        );
        return;
    }

    // Kartenkacheln → Network first (immer aktuell wenn online)
    if (url.hostname.includes('tile.openstreetmap') ||
        url.hostname.includes('opentopomap') ||
        url.hostname.includes('stadiamaps') ||
        url.hostname.includes('arcgisonline')) {
        event.respondWith(
            fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    // Alles andere → Cache first, network fallback
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
