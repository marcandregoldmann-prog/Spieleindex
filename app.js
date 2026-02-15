/**
 * Magdeburg Freizeitkarte PWA
 * Hauptlogik mit IndexedDB-Speicherung
 */

// ===== GLOBALE VARIABLEN =====
let map;
let markers = [];
let locations = [];
let currentFilter = 'all'; // 'all', 'playground', 'attraction'
let editingLocationId = null;
let tempMarker = null; // Temporärer Marker beim Hinzufügen

// IndexedDB
let db;
const DB_NAME = 'MagdeburgFreizeitDB';
const DB_VERSION = 1;
const STORE_NAME = 'locations';

// Magdeburg Koordinaten
const MAGDEBURG_CENTER = [52.1205, 11.6276];
const DEFAULT_ZOOM = 13;

// ===== INDEXEDDB INITIALISIERUNG =====
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB Fehler:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB erfolgreich geöffnet');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Lösche alten Store falls vorhanden
            if (db.objectStoreNames.contains(STORE_NAME)) {
                db.deleteObjectStore(STORE_NAME);
            }
            
            // Erstelle neuen Store
            const objectStore = db.createObjectStore(STORE_NAME, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
            
            // Erstelle Indizes
            objectStore.createIndex('category', 'category', { unique: false });
            objectStore.createIndex('rating', 'rating', { unique: false });
            objectStore.createIndex('lastVisit', 'lastVisit', { unique: false });
            
            console.log('IndexedDB Store erstellt');
        };
    });
}

// ===== CRUD OPERATIONEN =====
function saveLocation(location) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = location.id ? store.put(location) : store.add(location);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

function getAllLocations() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

function deleteLocation(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => {
            resolve();
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// ===== KARTEN-FUNKTIONEN =====
function initMap() {
    // Karte initialisieren
    map = L.map('map', {
        center: MAGDEBURG_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false
    });

    // Zoom Control an besserer Position
    L.control.zoom({
        position: 'bottomleft'
    }).addTo(map);

    // OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Click-Event für neue Pins
    map.on('click', onMapClick);
}

function onMapClick(e) {
    // Entferne alten temporären Marker
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }

    // Erstelle temporären Marker
    tempMarker = L.marker(e.latlng, {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    tempMarker.bindPopup('Neuer Ort<br><small>Klicke auf + um Details einzugeben</small>').openPopup();

    // Zeige Modal nach kurzer Verzögerung
    setTimeout(() => {
        openLocationModal(e.latlng.lat, e.latlng.lng);
    }, 500);
}

function createMarker(location) {
    const iconUrl = location.category === 'playground' 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';

    const marker = L.marker([location.lat, location.lng], {
        icon: L.icon({
            iconUrl: iconUrl,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    // Popup mit Details
    marker.bindPopup(createPopupContent(location));
    
    // Click-Event für Details
    marker.on('click', () => {
        showLocationDetails(location);
    });

    marker.locationData = location;
    markers.push(marker);
}

function createPopupContent(location) {
    const stars = '⭐'.repeat(location.rating);
    const categoryIcon = location.category === 'playground' ? '🎠' : '🎪';
    
    return `
        <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0;">${categoryIcon} ${location.name}</h3>
            <div style="font-size: 14px; color: #666;">
                ${stars}<br>
                Letzter Besuch: ${formatDate(location.lastVisit)}
            </div>
        </div>
    `;
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function loadMarkers() {
    clearMarkers();
    
    locations.forEach(location => {
        // Filter anwenden
        if (currentFilter === 'all' || currentFilter === location.category) {
            createMarker(location);
        }
    });
}

// ===== MODAL-FUNKTIONEN =====
function openLocationModal(lat = null, lng = null, location = null) {
    const modal = document.getElementById('locationModal');
    const form = document.getElementById('locationForm');
    const title = document.getElementById('modalTitle');

    // Formular zurücksetzen
    form.reset();
    editingLocationId = null;

    if (location) {
        // Bearbeitungs-Modus
        title.textContent = 'Ort bearbeiten';
        document.getElementById('locationId').value = location.id;
        document.getElementById('locationLat').value = location.lat;
        document.getElementById('locationLng').value = location.lng;
        document.getElementById('locationName').value = location.name;
        document.getElementById('locationCategory').value = location.category;
        document.getElementById('locationDate').value = location.lastVisit;
        document.getElementById('locationNotes').value = location.notes || '';
        document.getElementById('locationMapsLink').value = location.mapsLink || '';
        
        // Rating setzen
        const ratingInput = document.querySelector(`input[name="rating"][value="${location.rating}"]`);
        if (ratingInput) {
            ratingInput.checked = true;
        }
        
        editingLocationId = location.id;
    } else {
        // Neuer Ort
        title.textContent = 'Neuer Ort';
        document.getElementById('locationLat').value = lat;
        document.getElementById('locationLng').value = lng;
        
        // Heutiges Datum als Standard
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('locationDate').value = today;
    }

    modal.classList.add('active');
}

function closeLocationModal() {
    const modal = document.getElementById('locationModal');
    modal.classList.remove('active');
    
    // Entferne temporären Marker
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
}

function showLocationDetails(location) {
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('detailTitle');
    const content = document.getElementById('detailContent');

    const categoryIcon = location.category === 'playground' ? '🎠' : '🎪';
    const categoryLabel = location.category === 'playground' ? 'Spielplatz' : 'Attraktion';
    const categoryClass = location.category === 'playground' ? 'category-playground' : 'category-attraction';
    const stars = '⭐'.repeat(location.rating);

    title.textContent = `${categoryIcon} ${location.name}`;

    let mapsLinkHtml = '';
    if (location.mapsLink) {
        mapsLinkHtml = `
            <div class="detail-row">
                <div class="detail-label">Google Maps</div>
                <div class="detail-value">
                    <a href="${location.mapsLink}" target="_blank" style="color: var(--primary-color);">Auf Google Maps öffnen →</a>
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Kategorie</div>
            <div class="detail-value">
                <span class="category-badge ${categoryClass}">${categoryLabel}</span>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Bewertung</div>
            <div class="detail-value rating-stars">${stars}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Letzter Besuch</div>
            <div class="detail-value">${formatDate(location.lastVisit)}</div>
        </div>
        ${location.notes ? `
            <div class="detail-row">
                <div class="detail-label">Notizen</div>
                <div class="detail-value">${location.notes}</div>
            </div>
        ` : ''}
        ${mapsLinkHtml}
        <div class="detail-row">
            <div class="detail-label">Koordinaten</div>
            <div class="detail-value">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>
        </div>
    `;

    // Buttons vorbereiten
    document.getElementById('editLocationBtn').onclick = () => {
        closeDetailModal();
        openLocationModal(null, null, location);
    };

    document.getElementById('deleteLocationBtn').onclick = () => {
        if (confirm(`Möchtest du "${location.name}" wirklich löschen?`)) {
            deleteLocationFromDB(location.id);
            closeDetailModal();
        }
    };

    modal.classList.add('active');
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('active');
}

function showStats() {
    const modal = document.getElementById('statsModal');
    const content = document.getElementById('statsContent');

    if (locations.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                <p>Noch keine Orte gespeichert.</p>
                <p style="margin-top: 12px;">Füge deinen ersten Ort hinzu!</p>
            </div>
        `;
    } else {
        // Statistiken berechnen
        const totalLocations = locations.length;
        const playgrounds = locations.filter(l => l.category === 'playground').length;
        const attractions = locations.filter(l => l.category === 'attraction').length;
        
        const avgRating = (locations.reduce((sum, l) => sum + l.rating, 0) / totalLocations).toFixed(1);
        
        // Meistbesuchter Ort (neuestes lastVisit Datum)
        const sortedByVisit = [...locations].sort((a, b) => 
            new Date(b.lastVisit) - new Date(a.lastVisit)
        );
        const mostRecent = sortedByVisit[0];

        content.innerHTML = `
            <div class="stat-card">
                <h3>Gesamt</h3>
                <div class="stat-value">${totalLocations}</div>
                <div class="stat-label">Gespeicherte Orte</div>
            </div>
            
            <div class="stat-card">
                <h3>Kategorien</h3>
                <div class="stat-value">🎠 ${playgrounds} | 🎪 ${attractions}</div>
                <div class="stat-label">Spielplätze | Attraktionen</div>
            </div>
            
            <div class="stat-card">
                <h3>Durchschnittliche Bewertung</h3>
                <div class="stat-value">${avgRating} ⭐</div>
                <div class="stat-label">Von 5 Sternen</div>
            </div>
            
            <div class="stat-card">
                <h3>Zuletzt besucht</h3>
                <div class="stat-value" style="font-size: 18px;">${mostRecent.name}</div>
                <div class="stat-label">${formatDate(mostRecent.lastVisit)}</div>
            </div>
        `;
    }

    modal.classList.add('active');
}

function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    modal.classList.remove('active');
}

function showHelp() {
    const modal = document.getElementById('helpModal');
    modal.classList.add('active');
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('active');
}

// ===== FORMULAR-HANDLING =====
async function handleFormSubmit(e) {
    e.preventDefault();

    const locationData = {
        name: document.getElementById('locationName').value,
        category: document.getElementById('locationCategory').value,
        rating: parseInt(document.querySelector('input[name="rating"]:checked').value),
        lastVisit: document.getElementById('locationDate').value,
        notes: document.getElementById('locationNotes').value,
        mapsLink: document.getElementById('locationMapsLink').value,
        lat: parseFloat(document.getElementById('locationLat').value),
        lng: parseFloat(document.getElementById('locationLng').value)
    };

    // ID hinzufügen wenn bearbeitet wird
    if (editingLocationId) {
        locationData.id = editingLocationId;
    }

    try {
        await saveLocation(locationData);
        await loadLocations();
        closeLocationModal();
        showToast(editingLocationId ? 'Ort aktualisiert!' : 'Ort hinzugefügt!');
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        showToast('Fehler beim Speichern', true);
    }
}

async function deleteLocationFromDB(id) {
    try {
        await deleteLocation(id);
        await loadLocations();
        showToast('Ort gelöscht');
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        showToast('Fehler beim Löschen', true);
    }
}

async function loadLocations() {
    try {
        locations = await getAllLocations();
        loadMarkers();
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        showToast('Fehler beim Laden', true);
    }
}

// ===== FILTER-FUNKTIONEN =====
function setFilter(filter) {
    currentFilter = filter;
    loadMarkers();
    
    const filterLabels = {
        'all': 'Alle Orte',
        'playground': 'Spielplätze',
        'attraction': 'Attraktionen'
    };
    
    showToast(`Filter: ${filterLabels[filter]}`);
}

// ===== HILFSFUNKTIONEN =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'var(--danger-color)' : '#323232';
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Header Menu
    document.getElementById('menuBtn').addEventListener('click', toggleMenu);

    // Menu Items
    document.getElementById('showAllBtn').addEventListener('click', () => {
        setFilter('all');
        toggleMenu();
    });

    document.getElementById('filterPlaygroundBtn').addEventListener('click', () => {
        setFilter('playground');
        toggleMenu();
    });

    document.getElementById('filterAttractionBtn').addEventListener('click', () => {
        setFilter('attraction');
        toggleMenu();
    });

    document.getElementById('statsBtn').addEventListener('click', () => {
        showStats();
        toggleMenu();
    });

    document.getElementById('helpBtn').addEventListener('click', () => {
        showHelp();
        toggleMenu();
    });

    // FAB
    document.getElementById('addLocationBtn').addEventListener('click', () => {
        // Zentriere auf Magdeburg und öffne Modal
        const center = map.getCenter();
        openLocationModal(center.lat, center.lng);
    });

    // Location Modal
    document.getElementById('closeModal').addEventListener('click', closeLocationModal);
    document.getElementById('cancelBtn').addEventListener('click', closeLocationModal);
    document.getElementById('locationForm').addEventListener('submit', handleFormSubmit);

    // Detail Modal
    document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
    document.getElementById('closeDetailBtn').addEventListener('click', closeDetailModal);

    // Stats Modal
    document.getElementById('closeStatsModal').addEventListener('click', closeStatsModal);
    document.getElementById('closeStatsBtn').addEventListener('click', closeStatsModal);

    // Help Modal
    document.getElementById('closeHelpModal').addEventListener('click', closeHelpModal);
    document.getElementById('closeHelpBtn').addEventListener('click', closeHelpModal);

    // Schließe Menu beim Klick außerhalb
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('menu');
        const menuBtn = document.getElementById('menuBtn');
        
        if (!menu.contains(e.target) && e.target !== menuBtn) {
            menu.classList.add('hidden');
        }
    });

    // Schließe Modals beim Klick auf Hintergrund
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'locationModal' && tempMarker) {
                    map.removeLayer(tempMarker);
                    tempMarker = null;
                }
            }
        });
    });
}

// ===== SERVICE WORKER REGISTRIERUNG =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registriert:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker Registrierung fehlgeschlagen:', error);
            });
    });
}

// ===== APP INITIALISIERUNG =====
async function initApp() {
    try {
        await initDB();
        initMap();
        await loadLocations();
        initEventListeners();
        
        console.log('App erfolgreich initialisiert');
        
        // Zeige Hilfe beim ersten Start
        if (locations.length === 0) {
            setTimeout(() => {
                showHelp();
            }, 1000);
        }
    } catch (error) {
        console.error('Fehler bei der Initialisierung:', error);
        showToast('Fehler beim Laden der App', true);
    }
}

// App starten wenn DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
