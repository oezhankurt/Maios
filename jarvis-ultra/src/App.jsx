import React, { useState, useEffect } from 'react'
import JarvisInterface from './components/JarvisInterface'
import InstallPrompt from './components/InstallPrompt'
import './App.css'

export default function App() {
  return (
    <div className="app-container">
      <InstallPrompt />
      <div className="holographic-background">
        <div className="water-effect"></div>
        <svg className="scan-lines" viewBox="0 0 1920 1080">
          <defs>
            <pattern id="scanlines" patternUnits="userSpaceOnUse" width="4" height="4">
              <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(0, 255, 136, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1920" height="1080" fill="url(#scanlines)" />
        </svg>
        <div className="glow-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>
      <JarvisInterface />
    </div>
  )
}
