# Jarvis Desktop App 🖥️

Native Electron-App für Jarvis Voice Assistant.

## Features

✅ Native Desktop Integration  
✅ Hotkey Support (Alt+J to toggle)  
✅ System Tray Icon (optional)  
✅ Cross-Platform (Windows, macOS, Linux)  
✅ Auto-Start Support (optional)  

## Development

```bash
# Start dev server (in jarvis-web/)
cd ../jarvis-web
npm install
npm run dev

# In another terminal
cd ../jarvis-desktop
npm install
npm run dev
```

The Electron app loads the React dev server at http://localhost:5174

## Building

```bash
# Build React app first
cd ../jarvis-web
npm run build

# Then build Electron
cd ../jarvis-desktop
npm run build  # Creates platform-specific installers
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Alt+J | Show/Hide Jarvis |
| Cmd+Q / Ctrl+Q | Quit |
| Cmd+, / Ctrl+, | Settings |
| F12 | Toggle DevTools (dev only) |

## Configuration

Create `.env` file:

```env
NODE_ENV=development
```

## Release Notes

- v1.0.0: Initial release
  - Voice input/output
  - Claude API integration
  - Conversation history
  - Standing Orders support
