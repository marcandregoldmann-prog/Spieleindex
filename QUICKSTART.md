# 🚀 Schnellstart - Magdeburg Freizeitkarte PWA

## Option 1: Sofort lokal testen (5 Minuten)

1. **Alle Dateien herunterladen**
   - Lade alle Dateien in einen Ordner auf deinem Computer

2. **Lokalen Webserver starten**
   ```bash
   # Im Projektordner:
   python -m http.server 8000
   ```
   
3. **Im Browser öffnen**
   - Chrome/Edge: `http://localhost:8000`
   - Die App sollte jetzt laufen! 🎉

4. **App testen**
   - Klicke auf die Karte um einen Pin zu setzen
   - Fülle das Formular aus und speichere
   - Öffne das Menü (☰) für Filter und Statistiken

## Option 2: Auf GitHub Pages deployen (10 Minuten)

### Schritt 1: GitHub Repository erstellen
1. Gehe zu https://github.com
2. Klicke auf "New Repository"
3. Name: `magdeburg-freizeit-app` (oder eigener Name)
4. Public/Private wählen
5. "Create repository"

### Schritt 2: Code hochladen
```bash
cd magdeburg-pwa

# Git initialisieren
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Mit GitHub verbinden (URL anpassen!)
git remote add origin https://github.com/DEIN-USERNAME/magdeburg-freizeit-app.git
git push -u origin main
```

### Schritt 3: GitHub Pages aktivieren
1. Gehe zu deinem Repository auf GitHub
2. Settings → Pages (linke Sidebar)
3. Source: "Deploy from a branch"
4. Branch: `main`, Ordner: `/root`
5. "Save" klicken

### Schritt 4: App aufrufen
- URL: `https://DEIN-USERNAME.github.io/magdeburg-freizeit-app/`
- ⏰ Dauert 1-2 Minuten bis verfügbar

## Option 3: Auf Android installieren

### Voraussetzung: App läuft (Option 1 oder 2)

1. **Öffne die App im Chrome Browser** auf deinem Android-Gerät
   - Lokal: Verbinde Handy mit Computer im gleichen WLAN
   - Online: Öffne deine GitHub Pages URL

2. **Installiere die PWA**
   - Chrome: Menü (⋮) → "Zum Startbildschirm hinzufügen"
   - Bestätige mit "Hinzufügen"

3. **App nutzen**
   - Icon erscheint auf dem Homescreen
   - Funktioniert offline!
   - Sieht aus wie eine native App

## ⚡ Erste Schritte in der App

1. **Ersten Ort hinzufügen**
   - Klicke auf den blauen **+** Button
   - ODER: Klicke direkt auf die Karte
   - Fülle das Formular aus
   - Speichern!

2. **Kategorien nutzen**
   - 🎠 **Spielplatz** (grüner Pin)
   - 🎪 **Attraktion** (blauer Pin)

3. **Orte verwalten**
   - Pin anklicken → Details sehen
   - "Bearbeiten" oder "Löschen"

4. **Filter & Statistiken**
   - Menü (☰) öffnen
   - Filter wählen oder Statistiken ansehen

## 🎯 Tipps

- **Bewertungen**: 5 Sterne = Top Ort, 1 Stern = Nicht so toll
- **Notizen**: Schreibe was besonders war ("Tolles Klettergerüst!", "Zu voll am Wochenende")
- **Google Maps Link**: Einfach Link von Google Maps kopieren und einfügen
- **Offline**: Alles funktioniert ohne Internet (außer Kartenkacheln beim ersten Laden)

## ❓ Probleme?

**App lädt nicht?**
- Browser-Cache leeren (Strg+Shift+R)
- DevTools öffnen (F12) und Fehler in Console checken

**Karte zeigt nichts?**
- Internet beim ersten Laden benötigt
- Danach funktioniert alles offline

**Pins verschwinden?**
- Browser-Cache nicht leeren (dort werden Daten gespeichert!)
- Für Export-Funktion siehe README

## 🎡 Viel Spaß!

Bei Fragen schau in die README.md für Details!
