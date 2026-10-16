/* Last Pick offline helper. Upload this file next to your Last Pick page (same folder).
   Network first, so you always get your latest version when online; the saved copy is used when offline. */
const CACHE = "last-pick-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const same = u.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !fonts) return; // never cache API calls (Gemini, Rone Arena)
  e.respondWith(caches.open(CACHE).then(async c => {
    try {
      const n = await fetch(r);
      if (n.ok || n.type === "opaque") c.put(r, n.clone());
      return n;
    } catch (err) {
      const m = await c.match(r, { ignoreSearch: true });
      if (m) return m;
      throw err;
    }
  }));
});
