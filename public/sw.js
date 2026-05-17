const CACHE_NAME = "game-hub-v1";

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/games/snake",
  "/games/tetris",
  "/games/pong",
  "/games/space-invaders",
  "/games/breakout",
  "/games/minesweeper",
  "/games/tic-tac-toe",
  "/games/memory",
  "/games/flappy",
  "/games/typing",
  "/games/2048",
  "/games/hangman",
  "/games/bounce",
  "/manifest.json",
  "/logo/NostalGame.png",
];

// Install event - precache essential resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - stale-while-revalidate for pages, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and non-http requests
  if (!request.url.startsWith("http")) return;

  // For navigation requests (HTML pages) - network first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/offline");
          });
        })
    );
    return;
  }

  // For static assets - stale-while-revalidate
  if (
    request.url.includes("/_next/static/") ||
    request.url.includes("/icons/") ||
    request.url.endsWith(".js") ||
    request.url.endsWith(".css")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default - network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "",
    icon: "/logo/NostalGame.png",
    badge: "/logo/NostalGame.png",
    tag: data.tag || "default",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Buka Dashboard" },
      { action: "dismiss", title: "Tutup" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "NostalGame", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
