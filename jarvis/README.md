# Jarvis 🎤 — Voice Assistant für Claude

Ein eleganter Voice-Assistant für Claude, der dir hilft, durch Sprechen produktiver zu arbeiten.

## Features

✅ **Voice Input/Output** — Sprich mit Claude, höre Antworten  
✅ **Browser & Desktop** — Web-App + Electron Desktop-App  
✅ **Deutsch** — 100% auf Deutsch  
✅ **Offline** — Speech-to-Text/TTS funktioniert ohne Internet  
✅ **Memory** — Konversationshistorie speichern  
✅ **Standing Orders** — Deine Regeln für Jarvis  

## Projekt-Struktur

```
jarvis/
├── jarvis-web/       # React Vite Web-App
└── jarvis-desktop/   # Electron Desktop-App
```

## Quick Start

### Web-App

```bash
cd jarvis-web
npm install
cp .env.example .env
# Trage deinen Claude API Key in .env ein
npm run dev
```

Dann öffne http://localhost:5174

### Desktop-App (später)

```bash
cd jarvis-desktop
npm install
npm run dev
```

## Development Roadmap

1. ✅ Projektstruktur
2. 🔄 Speech APIs (Input/Output)
3. 🔄 Claude API Integration
4. 🔄 UI Components
5. 🔄 Memory System
6. 🔄 Electron Desktop-App
7. 🔄 Offline Mode
8. 🔄 Standing Orders
9. 🔄 Obsidian Vault Integration (optional)

## API Integration

Jarvis nutzt die Claude API für Intelligence. Du brauchst einen API Key von https://console.anthropic.com

```javascript
// Claude API wird in services/claudeService.js integriert
const response = await claudeService.sendMessage(userMessage, context)
```

## Lizenz

MIT
