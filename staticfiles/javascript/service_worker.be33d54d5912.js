self.addEventListener("install", async (e) => {
    return self.skipWaiting();
});

self.addEventListener("activate", (e) => {
    self.clients.claim();
});
