// Emergency kill switch for the service worker. If a deployed public/sw.js
// misbehaves, copy this file over public/sw.js and deploy: every phone that
// checks for a new worker (each launch; sw.js is served no-cache) deletes all
// caches and unregisters the worker; open pages carry on from the network. It
// never reloads them: the app registers /sw.js again on load, which would loop.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
      await self.registration.unregister();
    })(),
  );
});
