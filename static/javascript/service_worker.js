// Set up the service worker to make the app installable
// Information can set to be made available offline

self.addEventListener("install", async (e) => {
    return self.skipWaiting();
});

self.addEventListener("activate", async (e) => {
    self.clients.claim();
});

// A fetch event is required to make tha application installable
self.addEventListener("fetch", async () => {});
