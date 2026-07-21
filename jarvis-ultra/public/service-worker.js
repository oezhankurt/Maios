const CACHE_NAME = 'jarvis-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/App.css',
  '/src/components/JarvisInterface.jsx',
  '/src/components/JarvisInterface.css',
  '/src/components/VoiceInput.jsx',
  '/src/components/VoiceInput.css',
  '/src/components/ChatHistory.jsx',
  '/src/services/claudeService.js',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Cache addAll error:', err)
          return Promise.resolve()
        })
      })
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  if (request.url.includes('/api/claude')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const clonedResponse = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clonedResponse)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            return cached || new Response(
              JSON.stringify({
                error: { message: 'Du bist offline. Einige Funktionen sind nicht verfügbar.' }
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
  } else {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request))
        .catch(() => {
          return caches.match('/index.html')
        })
    )
  }
})
