/* Lesson pages: network first, so a new version shows up as soon as it's published; the cached copy is only used offline.
 * The lessons home (this folder's index.html), the course catalog it's built from and the app icons: from the device
 * first, so the home-screen app opens instantly, then refreshed from the network in the background; when that brings a
 * newer home or catalog (a lesson switched on), the open home page is told and refreshes itself. */
const CACHE = 'm10c-teaching-v1';
const SCOPE = new URL('./', self.location).href; // …/lessons/
const SHELL = ['./', 'manifest.webmanifest', 'assets/icon-180.png', 'assets/icon-192.png', 'assets/favicon.svg', '../js/catalog.js'].map((p) => new URL(p, self.location).href);
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => fetch(u, { cache: 'no-cache' }).then((r) => (r.ok ? c.put(u, r) : null)).catch(() => null)))));
});
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
// the home page (with or without index.html or ?class=…) is cached under one key
function shellKey(url) {
  const u = new URL(url); u.hash = '';
  if (u.href.split('?')[0] === SCOPE || u.href.split('?')[0] === SCOPE + 'index.html') return SCOPE;
  u.search = '';
  return SHELL.includes(u.href) ? u.href : null;
}
async function fromDeviceFirst(e, req, key) {
  const cache = await caches.open(CACHE), hit = await cache.match(key);
  const watch = hit && (key === SCOPE || /\/js\/catalog\.js$/.test(key)), before = watch ? hit.clone().text() : null;
  const net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(async (res) => { // by URL: a navigation request can't be re-sent with options
    if (!res.ok || res.type !== 'basic') return res;
    const copy = res.clone();
    if (watch) {
      const [a, b] = await Promise.all([before, res.clone().text()]);
      await cache.put(key, copy);
      if (a !== b) (await self.clients.matchAll({ type: 'window' })).forEach((c) => c.postMessage({ type: 'lessons-home-updated' }));
    } else await cache.put(key, copy);
    return res;
  });
  if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
  return net.catch(() => caches.match(req, { ignoreSearch: true }));
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = shellKey(req.url);
  if (key) { e.respondWith(fromDeviceFirst(e, req, key)); return; }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })));
});
