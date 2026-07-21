# J.A.R.V.I.S - Iron Man AI Assistant

A complete rebuild of the Jarvis Voice Assistant with an Iron Man JARVIS aesthetic. This is a modern, fully-featured AI assistant interface with voice recognition, text-to-speech, and Claude API integration.

## Features

✨ **Iron Man JARVIS Aesthetic**
- Holographic green UI with glow effects
- Water animation background with floating orbs
- Scan lines and holographic elements
- Smooth animations and transitions

🎤 **Voice Control**
- Web Speech API for voice recognition (German language)
- Automatic text-to-speech responses
- Auto-send when voice input ends
- Real-time listening indicator

💬 **Chat Interface**
- Clean, futuristic message display
- Real-time message streaming
- Conversation history (last 20 messages)
- Error handling and offline detection

🔌 **Claude API Integration**
- Express.js proxy server for API requests
- Proper CORS handling
- Environment-based API key configuration
- Anthropic API v1 compatibility

## Quick Start

### Prerequisites
- Node.js 16+ installed
- Claude API key from Anthropic

### Installation

1. Navigate to the jarvis-ultra directory:
```bash
cd jarvis-ultra
```

2. Install dependencies (already done):
```bash
npm install
```

3. Configure your API key:
Create a `.env` file in the jarvis-ultra directory:
```
VITE_CLAUDE_API_KEY=your-actual-claude-api-key-here
```

### Running the Application

Start both the backend proxy server and frontend dev server:

```bash
npm run start
```

This will start:
- **Backend API Proxy**: http://localhost:5175
- **Frontend Dev Server**: http://localhost:5173 (or next available port)

The application will automatically open in your browser.

### Individual Commands

**Frontend only** (Vite dev server):
```bash
npm run dev
```

**Backend only** (Express API proxy):
```bash
npm run server
```

**Production build**:
```bash
npm run build
```

## Architecture

### Frontend (`src/`)
- **App.jsx**: Main application component with holographic background
- **components/JarvisInterface.jsx**: Main chat interface
- **components/VoiceInput.jsx**: Voice recognition component
- **components/ChatHistory.jsx**: Message display component
- **services/claudeService.js**: Claude API service client

### Backend (`server.js`)
- Express.js proxy server
- Handles CORS for cross-origin requests
- Forwards requests to Anthropic API with proper headers
- Runs on port 5175

### Styling
- **src/index.css**: Global styles and animations
- **src/App.css**: Holographic background with water effects
- **src/components/*.css**: Component-specific styling

## How It Works

1. **Voice Input**: Click the microphone button to start listening
2. **Speech Recognition**: Your speech is converted to text using Web Speech API
3. **Auto-Send**: When you stop speaking, the message is automatically sent
4. **API Processing**: Message is sent through Express proxy to Claude API
5. **Response**: Claude's response is displayed and read aloud using text-to-speech

## Configuration

### Environment Variables
- `VITE_CLAUDE_API_KEY`: Your Claude API key (required)

### Model Configuration
Edit `src/services/claudeService.js` to change:
- API model (default: `claude-opus-4-8`)
- System prompt (JARVIS personality)
- Conversation history limit (default: 20 messages)

## Troubleshooting

**"API Key nicht konfiguriert" error**
- Add your API key to `.env` file
- Make sure it starts with `VITE_` for Vite to load it

**Port already in use**
- Change the port in `vite.config.js` (frontend)
- Change the port in `server.js` (backend)

**Voice recognition not working**
- Check browser permissions for microphone access
- Ensure language is set to German (de-DE)
- Some browsers require HTTPS for Speech API

**API requests failing**
- Verify your Claude API key is valid
- Check internet connection
- Ensure backend proxy server is running on port 5175

## Browser Compatibility

- Chrome/Edge 87+
- Firefox 78+
- Safari 14.1+
- Opera 73+

Web Speech API requires a modern browser with speech recognition support.

## Future Enhancements

- [ ] Multiple language support
- [ ] Save conversation history
- [ ] Custom system prompts
- [ ] Voice settings adjustment
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Message export/import

## Project Structure

```
jarvis-ultra/
├── index.html           # Entry point
├── vite.config.js       # Vite configuration
├── server.js            # Express backend
├── package.json         # Dependencies
├── .env                 # Environment variables (create this)
├── .gitignore          # Git ignore rules
└── src/
    ├── main.jsx        # React entry point
    ├── index.css       # Global styles
    ├── App.jsx         # Main component
    ├── App.css         # Background animations
    ├── components/
    │   ├── JarvisInterface.jsx
    │   ├── JarvisInterface.css
    │   ├── VoiceInput.jsx
    │   ├── VoiceInput.css
    │   └── ChatHistory.jsx
    └── services/
        └── claudeService.js
```

## License

MIT - Feel free to use and modify for your projects.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify your API key and internet connection
3. Check browser console for detailed error messages
4. Ensure all servers are running on the correct ports

---

**J.A.R.V.I.S** - Just A Rather Very Intelligent System. Very good, sir.
