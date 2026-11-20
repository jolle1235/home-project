// The app's service worker. Hand-written source (no build step); served with
// Cache-Control: no-cache (next.config.ts) and registered in production only
// (app/components/ServiceWorker.tsx). Emergency: public/sw-kill.js.
//
// - /recipes, the start page, opens from the last-seen copy while a fresh one is
//   fetched; the page is then told over a MessageChannel what to do:
//   "fresh" (refetch the list), "reload" (the fresh copy is from a new deploy) or
//   "gone" (the server redirected, e.g. to /login). No other page is cached:
//   forms and the shopping list must never show an old copy.
// - /_next/static/* is cache-first: the files are hashed and never change.
// - Logging in empties the page cache before the browser follows the redirect.
const PAGES = "pages-v1";
const STATIC = "static-v1";
const START_PAGE = "/recipes";
const STATIC_MAX_ENTRIES = 300;
const HELLO_TIMEOUT_MS = 10000;

// Bumped when the page cache is emptied, so a fetch that started before can't
// store its page afterwards.
let generation = 0;
// Set while a page served from the cache may say hello (see deliver).
let onHello = null;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Also removes the caches of the old next-pwa worker.
      for (const name of await caches.keys()) {
        if (name !== PAGES && name !== STATIC) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "hello") answerHello(event.ports[0]);
});

function answerHello(port) {
  if (onHello) onHello(port);
  else port?.close();
}

const isLogin = (request, url) =>
  request.mode === "navigate" && request.method === "POST" && url.pathname === "/api/login";
const isStatic = (request, url) =>
  request.method === "GET" && url.pathname.startsWith("/_next/static/");
const isStartPage = (request, url) =>
  request.mode === "navigate" && request.method === "GET" && url.pathname + url.search === START_PAGE;

// [test, handler]: the first match answers; everything else goes to the network untouched.
const ROUTES = [
  [isLogin, login],
  [isStatic, cacheFirst],
  [isStartPage, staleWhileRevalidate],
];

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const route =
    url.origin === self.location.origin && ROUTES.find(([test]) => test(event.request, url));
  if (route) event.respondWith(route[1](event));
});

// The cache is empty before the browser follows the login's redirect.
async function login(event) {
  const [response] = await Promise.all([fetch(event.request), clearPages()]);
  return response;
}

async function clearPages() {
  generation++;
  await caches.delete(PAGES);
}

// Responses go back at once; storing them happens after (waitUntil).
async function cacheFirst(event) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(event.request);
  if (hit) return hit;
  const response = await fetch(event.request);
  if (response.ok) event.waitUntil(store(cache, event.request, response.clone()));
  return response;
}

async function store(cache, request, response) {
  await cache.put(request, response);
  const keys = await cache.keys(); // oldest first
  await Promise.all(keys.slice(0, -STATIC_MAX_ENTRIES).map((key) => cache.delete(key)));
}

async function staleWhileRevalidate(event) {
  const started = generation;
  const response = fetch(event.request);
  const kept = response.then((fresh) => keep(fresh.clone(), started));
  const cached = await caches.match(START_PAGE, { cacheName: PAGES, ignoreVary: true });
  if (!cached) {
    event.waitUntil(kept.catch(() => {}));
    return response;
  }
  event.waitUntil(deliver(noticeFor(cached.clone(), kept)));
  return cached;
}

// Navigations don't follow redirects, so a redirect arrives as "opaqueredirect".
const isStorable = (response) =>
  response.ok && String(response.headers.get("content-type")).includes("text/html");
const isGone = (response) => response.type === "opaqueredirect" || response.status === 404;

// Stores a fresh /recipes (unless the cache was emptied meanwhile) or deletes a gone one.
async function keep(response, started) {
  const pages = await caches.open(PAGES);
  if (isGone(response)) {
    await pages.delete(START_PAGE);
    return { notice: "gone" };
  }
  if (!isStorable(response)) return { notice: null };
  const html = await response.clone().text();
  if (generation === started) await pages.put(START_PAGE, response);
  return { notice: "fresh", html };
}

// "fresh", unless the fresh page loads other scripts than the copy on screen (a new deploy).
async function noticeFor(cached, kept) {
  try {
    const { notice, html } = await kept;
    if (notice !== "fresh") return notice;
    return scripts(await cached.text()) === scripts(html) ? "fresh" : "reload";
  } catch {
    return null; // offline: keep showing the copy
  }
}

function scripts(html) {
  return [...new Set(html.match(/\/_next\/static\/[^"'\s]+\.js/g) ?? [])].sort().join(" ");
}

// Waits for both the notice and the page's hello (it may come first or last), and
// keeps the worker alive meanwhile, so the notice isn't lost.
async function deliver(notice) {
  const port = new Promise((resolve) => {
    onHello = resolve;
    setTimeout(() => resolve(null), HELLO_TIMEOUT_MS);
  });
  const [message, target] = await Promise.all([notice, port]);
  onHello = null;
  if (target && message) target.postMessage({ type: message });
}
