// Offline cache. Bump VERSION whenever any file below changes so phones pick up the update.
const VERSION = 'v55';
const FILES = ['./', 'index.html', 'style.css', 'data.js', 'questions.js', 'patterns.js', 'practice.js', 'notes.js', 'notes-bg.js', 'notes-en.js', 'notes-en2.js', 'notes-lit.js', 'notes-lit2.js', 'notes-ict.js', 'dp-data.js', 'dp-data2.js', 'dp.js', 'study.js', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first (so updates show up when online), cache as fallback when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
