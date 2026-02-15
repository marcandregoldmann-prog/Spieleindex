# 🎡 Magdeburg Freizeitkarte PWA

Eine Progressive Web App zur Verwaltung deiner persönlichen Spielplatz- und Freizeitaktivitäten in Magdeburg.

## ✨ Features

- 🗺️ **Interaktive Karte** mit OpenStreetMap & Leaflet
- 📍 **Manuelles Setzen von Pins** durch Klick auf die Karte
- 🎠 **Kategorisierung**: Spielplätze & Attraktionen mit visueller Unterscheidung
- ⭐ **Bewertungssystem**: 1-5 Sterne für jeden Ort
- 📝 **Notizen & Details**: Name, Datum des letzten Besuchs, Freitext-Notizen
- 🔗 **Google Maps Integration**: Optionale Links zu Google Maps
- 🔍 **Filter-Funktion**: Nach Kategorie filtern
- 📊 **Statistiken**: Durchschnittsbewertung, meistbesuchter Ort, Gesamtanzahl
- 📱 **Mobile-First**: Optimiert für Android-Smartphones
- 💾 **Offline-fähig**: Volle Funktionalität ohne Internetverbindung
- 🔒 **Privat**: Alle Daten bleiben lokal auf deinem Gerät (IndexedDB)

## 🚀 Installation & Deployment

### Lokal testen

1. Dateien herunterladen
2. Einen lokalen Webserver starten:
   ```bash
   # Mit Python
   python -m http.server 8000
   
   # Oder mit Node.js
   npx http-server
   ```
3. Im Browser öffnen: `http://localhost:8000`

### GitHub Pages Deployment

1. **Repository erstellen**
   - Gehe zu GitHub und erstelle ein neues Repository
   - Name z.B.: `magdeburg-freizeit-app`

2. **Code hochladen**
   ```bash
   cd magdeburg-pwa
   git init
   git add .
   git commit -m "Initial commit: Magdeburg Freizeitkarte PWA"
   git branch -M main
   git remote add origin https://github.com/DEIN-USERNAME/magdeburg-freizeit-app.git
   git push -u origin main
   ```

3. **GitHub Pages aktivieren**
   - Gehe zu Repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` / Root
   - Speichern

4. **App aufrufen**
   - Nach ca. 1-2 Minuten erreichbar unter:
   - `https://DEIN-USERNAME.github.io/magdeburg-freizeit-app/`

### Als PWA installieren (Android)

1. Öffne die App im Chrome Browser
2. Tippe auf das Menü (⋮) → "Zum Startbildschirm hinzufügen"
3. Bestätige mit "Hinzufügen"
4. Die App erscheint als Icon auf deinem Homescreen
5. Öffne die App wie eine native App!

## 📱 Nutzung

### Neuen Ort hinzufügen
- **Methode 1**: Klicke auf den blauen **+** Button unten rechts
- **Methode 2**: Klicke direkt auf die Karte an der gewünschten Position

### Ort anzeigen
- Klicke auf einen Pin auf der Karte
- Details werden im Popup und im Detail-Modal angezeigt

### Ort bearbeiten/löschen
1. Klicke auf den Pin
2. Im Detail-Modal: "Bearbeiten" oder "Löschen"

### Orte filtern
1. Öffne das Menü (☰ oben rechts)
2. Wähle Filter: Alle / Nur Spielplätze / Nur Attraktionen

### Statistiken anzeigen
1. Öffne das Menü (☰)
2. Klicke auf "📊 Statistiken"

## 🛠️ Technische Details

### Verwendete Technologien
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Karte**: Leaflet.js mit OpenStreetMap
- **Speicherung**: IndexedDB (idb)
- **PWA**: Service Worker, Web App Manifest
- **Hosting**: GitHub Pages (statisch, kein Backend)

### Dateistruktur
```
magdeburg-pwa/
├── index.html           # Haupt-HTML-Datei
├── styles.css           # App-Styling
├── app.js              # Hauptlogik & IndexedDB
├── service-worker.js   # Offline-Funktionalität
├── manifest.json       # PWA-Manifest
├── icon-192.png        # App-Icon 192x192
├── icon-512.png        # App-Icon 512x512
└── README.md          # Diese Datei
```

### Datenspeicherung
- **Speicherort**: IndexedDB im Browser
- **Datenbankname**: `MagdeburgFreizeitDB`
- **Store**: `locations`
- **Felder pro Ort**:
  - `id`: Auto-Increment ID
  - `name`: Name des Ortes
  - `category`: 'playground' oder 'attraction'
  - `rating`: 1-5
  - `lastVisit`: ISO-Datum
  - `notes`: Freitext
  - `mapsLink`: Google Maps URL
  - `lat`, `lng`: Koordinaten

### Browser-Kompatibilität
- ✅ Chrome/Edge (empfohlen)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ✅ Samsung Internet
- ⚠️ Ältere Browser (<2020) eingeschränkt

## 🔧 Anpassungen & Erweiterungen

### Karten-Zentrum ändern
In `app.js`, Zeile 20-21:
```javascript
const MAGDEBURG_CENTER = [52.1205, 11.6276]; // Andere Koordinaten
const DEFAULT_ZOOM = 13; // Zoom-Level ändern
```

### Farben anpassen
In `styles.css`, `:root` Variablen ändern:
```css
:root {
    --primary-color: #2196F3;      /* Hauptfarbe */
    --playground-color: #4CAF50;   /* Spielplatz-Farbe */
    --attraction-color: #2196F3;   /* Attraktions-Farbe */
}
```

### Weitere Kategorien hinzufügen
1. In `index.html` Formular erweitern
2. In `app.js` Filter & Marker-Icons anpassen
3. In `styles.css` neue Farben definieren

## 📝 Tipps

- **Backup**: Daten sind nur lokal! Bei Browser-Cache-Leerung gehen sie verloren
- **Export**: Erweitere die App mit Export-Funktion (JSON)
- **Teilen**: Da GitHub Pages öffentlich ist, kann jeder die App nutzen (aber mit eigenen Daten)
- **Updates**: Einfach neue Dateien hochladen und pushen

## 🐛 Fehlersuche

**App lädt nicht?**
- Prüfe Browser-Konsole (F12)
- Service Worker Cache leeren: DevTools → Application → Clear Storage

**Karte wird nicht angezeigt?**
- Internetverbindung prüfen (beim ersten Laden)
- Leaflet CDN erreichbar?

**Pins verschwinden?**
- IndexedDB prüfen: DevTools → Application → IndexedDB
- Keine Browser-Erweiterungen die Storage blockieren?

## 📄 Lizenz

Frei verwendbar für private Zwecke. OpenStreetMap-Daten unterliegen der ODbL-Lizenz.

## 🎯 Ideen für Erweiterungen

- [ ] Export/Import Funktion (JSON)
- [ ] Bilder zu Orten hinzufügen
- [ ] Wegbeschreibung zwischen Orten
- [ ] Favoriten-Funktion
- [ ] Such-Funktion nach Namen
- [ ] Kategorien erweitern (Restaurants, Parks, etc.)
- [ ] Teilen-Funktion (nur die App, nicht die Daten)
- [ ] Dark Mode
- [ ] Mehrsprachigkeit

Viel Spaß mit deiner Magdeburg Freizeitkarte! 🎡
