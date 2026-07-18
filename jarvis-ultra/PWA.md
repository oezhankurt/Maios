# JARVIS PWA - Progressive Web App

Diese Anwendung ist eine vollwertige Progressive Web App (PWA). Sie kann auf Handy und Computer als echte App installiert werden!

## ✨ PWA Features

### 📱 Installation
- **Windows/Mac/Linux**: Browser zeigt "Installieren"-Button oben rechts
- **iPhone/iPad**: Share → Zum Home-Bildschirm hinzufügen
- **Android**: Browser zeigt "App installieren"-Banner

### 🔌 Offline-Funktionalität
- Service Worker cached alle UI-Assets
- App funktioniert offline (Spracherkennung, Chat-History)
- API-Anfragen zeigen Offline-Meldung wenn nötig
- Beim Reconnect werden Anfragen automatisch wieder versucht

### 🎨 Native App-Feeling
- Vollbild-Modus (ohne Browser-UI)
- Custom Splash Screen
- App-Icons für alle Geräte
- Status Bar Integration

### 🚀 Schnelle Performance
- Lazy Loading von Komponenten
- CSS-in-JS für schnelleres Rendering
- Service Worker Pre-Caching
- Optimierte Bundle-Größe

## 📦 Installation auf Gerät

### Desktop (Windows/Mac/Linux)
1. Öffne die App im Browser (localhost:5173 oder produzierte URL)
2. Klick auf "Installieren" oben rechts (wenn verfügbar)
3. Bestätige Installation
4. App funktioniert jetzt wie eine normale Desktop-App

### iPhone/iPad
1. Öffne Safari und navigiere zur App
2. Tippe auf das Share-Symbol (Pfeil nach oben)
3. Wähle "Zum Home-Bildschirm"
4. App erscheint auf deinem Home Screen

### Android
1. Öffne Chrome und navigiere zur App
2. Browser zeigt Banner "App installieren"
3. Tippe "Installieren"
4. App funktioniert wie eine Native App

## 🔧 PWA Konfiguration

### manifest.json
- App-Metadaten (Name, Beschreibung, Icons)
- Display-Modi (standalone = Vollbild)
- Theme Colors
- App Shortcuts

### service-worker.js
- Cache-Strategie für Assets
- Offline-Fallback
- Background Sync (geplant)
- Push Notifications (geplant)

### Icons
- 192x192 und 512x512 für verschiedene Geräte
- Maskable Icons für adaptive Icons
- SVG für optimale Qualität

## 📊 Browser-Unterstützung

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome/Edge | ✅ | ✅ | Vollständig |
| Firefox | ✅ | ✅ | Teilweise |
| Safari | ✅ | ⚠️ | Begrenzt (iOS 15.1+) |
| Samsung Internet | - | ✅ | Vollständig |

## 🔒 HTTPS Anforderung

**Produktiv:** PWA funktioniert nur über HTTPS!
**Lokal:** localhost wird als sicher behandelt

Beim Hosting (z.B. Vercel, Railway) wird HTTPS automatisch aktiviert.

## 📈 Performance Tipps

- **Cache First**: Assets werden gecacht für schnellere Offline-Nutzung
- **Network First**: API-Anfragen versuchen zuerst online zu gehen
- **Stale While Revalidate**: Zeige Cache während Update lädt

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
npm run build
vercel deploy
```

### Railway
```bash
railway up
```

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder
```

## 🔍 Testing

### DevTools
1. Chrome DevTools → Application → Service Workers
2. Sieh den Cache-Status
3. Simuliere Offline-Mode

### Lighthouse
1. Chrome DevTools → Lighthouse
2. Generate PWA Report
3. Überprüfe PWA-Score (sollte 90+)

## ⚙️ Troubleshooting

**Service Worker wird nicht registriert:**
- HTTPS erforderlich (außer localhost)
- Browser-Cache leeren
- Neustart der App

**App wird nicht installierbar angezeigt:**
- manifest.json muss gültig sein
- Mindestens 192x192 Icon erforderlich
- Start URL muss gültig sein

**Offline funktioniert nicht:**
- Service Worker muss aktiv sein
- Browser-Einstellungen überprüfen
- Cache nicht gelöscht?

## 📝 Zukünftige Features

- [ ] Background Sync für Nachrichten
- [ ] Push Notifications
- [ ] Conversation Export (PDF)
- [ ] Custom Themes
- [ ] Voice Profiles
- [ ] Offline Chat History

---

**JARVIS PWA** - Installierbar. Offline-fähig. Überall erreichbar. 🚀
