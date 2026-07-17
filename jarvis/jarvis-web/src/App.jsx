import './App.css'
import JarvisVoiceChat from './components/JarvisVoiceChat'
import OfflineIndicator from './components/OfflineIndicator'

function App() {
  return (
    <div className="app">
      <OfflineIndicator />
      <JarvisVoiceChat />
    </div>
  )
}

export default App
