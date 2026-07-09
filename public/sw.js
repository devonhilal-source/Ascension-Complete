// Bump this on every deploy that changes cached files so old clients pick up the update.
const CACHE_VERSION = 'v1';
const SHELL_CACHE = `ascension-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ascension-runtime-${CACHE_VERSION}`;
const FONT_CACHE = `ascension-fonts-${CACHE_VERSION}`;

// Minimal set of files we know exist at build time.
// Hashed JS/CSS bundles get cached automatically the first time they're fetched (see fetch handler).
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {
      // Don't let a single failed precache request block install.
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const validCaches = [SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests; let everything else (POST etc.) pass through untouched.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Page navigations: network-first, fall back to cached app shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/', clone));
          return response;
        })
        .catch(() => caches.match('/').then((cached) => cached || caches.match(request)))
    );
    return;
  }

  // Google Fonts: stale-while-revalidate so they work offline after first load.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Same-origin static assets (hashed JS/CSS from /assets/, icons, etc.): cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
  }
});
