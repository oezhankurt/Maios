# Chrome Extension Setup Guide

## 📦 Was ist die Maios Chrome Extension?

Die Extension zeigt dir **Echtzeit-Produktdaten direkt auf Amazon.de und Otto.de** ohne dass du Maios verlassen musst.

### Features
✅ Automatische Produkterkennung (ASIN/SKU)  
✅ Live-Preise & Wettbewerbsanalyse  
✅ Verkaufsmetriken (täglich, monatlich)  
✅ Ranking & BSR Daten  
✅ One-Click Link zu Maios Dashboard  

---

## 🚀 Installation (Schnell)

### Schritt 1: Browser öffnen
Chrome oder Edge öffnen und folgende URL eingeben:
```
chrome://extensions/
```

### Schritt 2: Developer Mode aktivieren
Oben rechts: **"Developer Mode"** Toggle **AN**

### Schritt 3: Extension laden
Oben links: **"Load unpacked"** klicken

### Schritt 4: Ordner wählen
Navigiere zu: `/home/user/Maios/extension`  
**Bestätigen** → Extension sollte angezeigt werden

---

## ✅ Extension ist installiert wenn:

- [ ] Extension sichtbar in `chrome://extensions/`
- [ ] Status: **"Errors"** oder **"Enabled"**
- [ ] Ein Icon in der Chrome Toolbar (oben rechts)

---

## 🧪 Extension testen

### Test 1: Popup öffnen
1. Klick auf Maios Extension Icon (Toolbar)
2. Popup sollte öffnen mit Info
3. Button "Maios öffnen" sollte funktionieren

### Test 2: Amazon Produktseite
1. Gehe zu: https://www.amazon.de/
2. Öffne eine beliebige Produktseite (z.B. Technik, Bücher)
3. URL sollte so aussehen: `https://www.amazon.de/...dp/[ASIN]/...`
4. **Sidebar sollte automatisch öffnen** (rechts)

### Test 3: Otto Produktseite
1. Gehe zu: https://www.otto.de/
2. Öffne eine beliebige Produktseite
3. URL sollte so aussehen: `https://www.otto.de/p/[PRODUKT-ID]/`
4. **Sidebar sollte automatisch öffnen** (rechts)

### Test 4: Daten anzeigen
Wenn alles funktioniert, sollte Sidebar zeigen:
- Produktname
- SKU
- Preis
- Verkaufsmetriken
- Wettbewerbsinfos

---

## 🔐 Authentifizierung (wichtig!)

Die Extension braucht deinen **Maios Login-Token**.

### Automatisch
Wenn du dich in Maios anmeldest, speichert die App den Token automatisch.

### Manuell (falls nötig)
```javascript
// In Browser Console auf maios.vercel.app:
const token = localStorage.getItem('maios_token');
console.log(token);
```

### Token Check in Extension
1. Öffne: `chrome://extensions/`
2. Klick auf Maios Extension
3. Klick "inspect views" → "service_worker"
4. Console Tab → Prüfe auf Fehler

---

## 🐛 Troubleshooting

### Problem: Extension lädt nicht

**Lösung:**
```
1. chrome://extensions/ öffnen
2. "Developer Mode" Toggle AN
3. F5 drücken (Seite neu laden)
4. Extension sollte erscheinen
```

### Problem: Sidebar öffnet nicht auf Amazon

**Prüfe:**
1. Bist du auf einer Amazon.de **Produktseite**?
2. URL muss `/dp/[ASIN]/` enthalten
3. Browser Console (F12 → Console) auf Fehler prüfen
4. Extension aktiviert? (chrome://extensions/ checken)

**Lösung:**
```javascript
// In Browser Console:
console.log(document.location.href);
// Sollte: https://www.amazon.de/...dp/B0XXXXXX/...
```

### Problem: "Fehler beim Laden der Daten"

**Gründe:**
- Nicht in Maios angemeldet
- Session abgelaufen
- Produkt nicht in Maios Datenbank

**Lösung:**
1. Öffne Maios Dashboard: https://maios-production.up.railway.app
2. Logge dich ein mit: test@example.com / password123
3. Versuche Amazon Seite neu zu laden
4. Sidebar sollte jetzt Daten zeigen

### Problem: "Not authenticated"

**Grund:** Extension hat keinen Token

**Lösung:**
1. Gehe zu: https://maios-production.up.railway.app
2. Logge dich ein
3. Token wird automatisch gespeichert
4. Reload Amazon Seite

### Problem: Extension Icon fehlt

**Lösung:**
```
1. chrome://extensions/ öffnen
2. Maios Extension finden
3. Unter "Display options" → "Show in toolbar" wählen
4. Icon sollte erscheinen
```

---

## 📁 Extension Dateien

```
/home/user/Maios/extension/
├── manifest.json              ← Extension Konfiguration
├── background.js              ← API Logic (Service Worker)
├── popup.html                 ← Popup UI
├── popup.js                   ← Popup Logic
├── content-scripts/
│   ├── amazon.js             ← Amazon.de Injection
│   └── otto.js               ← Otto.de Injection
├── styles/
│   └── content.css           ← Sidebar Design
├── icons/                     ← Icons (später)
└── README.md
```

---

## 🔄 Debugging Tipps

### Extension Logs anschauen
1. `chrome://extensions/` öffnen
2. Maios Extension finden
3. Klick: **"Errors"** (falls rot)
4. Oder: Klick **"inspect views"** → **"service_worker"**
5. Console Tab öffnen

### Console auf Produktseite
1. Auf Amazon.de Produktseite
2. F12 drücken (DevTools öffnen)
3. Console Tab
4. Fehler sichtbar?

### Network Activity
1. DevTools öffnen (F12)
2. Network Tab
3. Filter: "xhr" oder "fetch"
4. Prüfe API Calls beim Öffnen der Sidebar

---

## 🎨 Sidebar Design

**Farben:**
- Purple Gradient: `#667eea → #764ba2`
- Dark Text: `#333333`
- Light Background: `#f5f5f5`

**Layout:**
- Fixed Position: rechts, full-height
- Smooth Slide-In Animation
- Responsive auf alle Geräte
- Scrollbar für lange Inhalte

---

## 🚀 Nächste Features

### Geplant
- [ ] Settings/Options Page
- [ ] Dark Mode
- [ ] Keyboard Shortcuts (Alt+M)
- [ ] Notifications für Preisänderungen
- [ ] eBay.de Support
- [ ] Kaufland.de Support
- [ ] Offline Mode
- [ ] Export Daten (CSV/Excel)

---

## 📊 Welche Daten zeigt die Extension?

### Produktinfos
```
- Produktname
- SKU
- ASIN (Amazon)
- Preis (EUR)
```

### Verkaufsmetriken
```
- Tagesverkäufe
- Monatsverkäufe
- Ranking
- BSR (Best Seller Rank)
```

### Wettbewerber (Top 3)
```
- Seller Name
- Verkaufspreis
```

---

## 🔒 Sicherheit

**Die Extension:**
- ✅ Speichert Token lokal in `chrome.storage.sync`
- ✅ Sendet Token nur an Backend
- ✅ Verwendet HTTPS für alle Requests
- ⚠️ Zeigt Produktdaten nur wenn authentifiziert

**NICHT:**
- ❌ Speichert Passwörter
- ❌ Trackert Browserverlauf
- ❌ Verkauft Daten an Dritte
- ❌ Modifiziert Amazon/Otto Seiten

---

## 💡 Pro Tips

### Schneller Zugriff
1. Pin Extension in Toolbar (Rechtsklick → Pin)
2. Keyboard Shortcut: `chrome://extensions/shortcuts`

### Daten aktualisieren
Relade die Seite (F5) um neue Daten zu laden

### Sidebar schließen
Klick **X** oben rechts in der Sidebar

### Zu Maios wechseln
Klick **"In Maios öffnen"** → Öffnet Dashboard

---

## 📞 Support

**Extension funktioniert nicht?**

1. Check: `chrome://extensions/` → Errors?
2. Check: Bist du in Maios angemeldet?
3. Check: Browser Console (F12) auf Fehler
4. Check: Ist die Seite wirklich amazon.de oder otto.de?

**Extension Logs ansehen:**
```
1. chrome://extensions/
2. Find Maios
3. Click "inspect views" → "service_worker"
4. Console tab → Prüfe auf Meldungen
```

---

## ✨ Extension ist erfolgreich installiert wenn:

✅ Icon in Toolbar  
✅ Popup öffnet sich  
✅ Sidebar öffnet sich auf Amazon/Otto  
✅ Produktdaten werden angezeigt  
✅ Keine Fehler in Console  

---

**Version:** 1.0.0  
**Stand:** 2026-07-17  
**Für:** Chrome & Edge Browser
