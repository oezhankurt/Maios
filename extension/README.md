# Maios Chrome Extension

Echtzeit-Produktdaten auf Amazon.de und Otto.de - direkt in der Sidebar.

## Installation

### Entwicklung (Load Unpacked)

1. Öffne `chrome://extensions/` in Chrome
2. Schalte "Entwicklermodus" ein (oben rechts)
3. Klicke auf "Extension laden" (oben links)
4. Wähle das Verzeichnis `/extension` aus

### Features

- ✅ Automatische ASIN/SKU-Erkennung auf Produktseiten
- ✅ Echtzeit-Produktdaten aus Maios Backend
- ✅ Verkaufsmetriken (täglich, monatlich)
- ✅ Wettbewerbsanalyse (Top 3 Konkurrenten)
- ✅ Ranking & BSR Daten
- ✅ Responsive Sidebar UI

### Unterstützte Seiten

- amazon.de - Alle Produktseiten
- otto.de - Alle Produktseiten

### Anforderungen

- Maios Account & Login
- Backend Token wird automatisch aus Maios App synchronisiert

## Architektur

### Files

- `manifest.json` - Extension Konfiguration
- `background.js` - Service Worker für API Calls
- `content-scripts/amazon.js` - Amazon.de Injection
- `content-scripts/otto.js` - Otto.de Injection
- `popup.html/js` - Extension Popup UI
- `styles/content.css` - Sidebar Styling

### Datenfluss

```
Amazon/Otto Seite
    ↓
Content Script (ASIN/SKU erkennen)
    ↓
Background Service Worker (API Call)
    ↓
Maios Backend (Daten abfragen)
    ↓
Sidebar (Daten anzeigen)
```

## Authentifizierung

Die Extension nutzt den Token aus dem Maios Dashboard. Nach Login speichert die Maios App automatisch den Token in Chrome Storage, den die Extension verwendet.

### Token-Speicherung

```javascript
chrome.storage.sync.set({ 'maios_token': token })
```

## Weitere Entwicklung

- [ ] Settings/Options Page für Konfiguration
- [ ] Dark Mode Support
- [ ] Keyboard Shortcuts
- [ ] Notifications für Preisänderungen
- [ ] Integration mit Maios Dashboard
- [ ] eBay.de & Kaufland.de Support

## Testing

1. Installiere Extension wie oben beschrieben
2. Logge dich in Maios ein
3. Öffne eine Amazon.de oder Otto.de Produktseite
4. Sidebar sollte automatisch öffnen
5. Produktdaten sollten angezeigt werden

## Fehlerbehandlung

- Fehler beim Laden der Daten werden im Popup angezeigt
- Check Console (F12 → Console) für Debug-Infos
- Stelle sicher, dass du in Maios angemeldet bist
