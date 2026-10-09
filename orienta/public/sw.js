/* Service worker di Orienta.
 * - Le route /api/ non passano MAI dalla cache: contengono o producono dati sanitari.
 * - Navigazione: prima la rete, poi la copia in cache, infine la pagina /offline. Le pagine si
 *   salvano senza i parametri dell'indirizzo, che possono dire qualcosa sulla salute di chi usa
 *   l'app (l'app tiene ricerche e filtri dopo «#», che non arriva qui, ma un link può averne).
 * - Asset statici (/_next/static, /icons, /models): prima la cache.
 * - «Elimina tutti i miei dati» chiede di tenere solo le pagine di base (messaggio orienta:svuota-cache).
 */
const VERSION = "orienta-v3";
const PRECACHE = ["/offline", "/emergenza", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    const page = url.origin + url.pathname;
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(page, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(page)) || (await caches.match("/offline")) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/models/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((cache) => cache.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "orienta:svuota-cache") return;
  event.waitUntil(
    (async () => {
      const keep = new Set(PRECACHE.map((p) => new URL(p, self.location.origin).href));
      for (const key of await caches.keys()) {
        if (key !== VERSION) {
          await caches.delete(key);
          continue;
        }
        // Restano le pagine di base e gli asset statici (servono a Emergenza e Offline senza rete)
        const cache = await caches.open(key);
        for (const request of await cache.keys()) {
          const path = new URL(request.url).pathname;
          const asset = path.startsWith("/_next/static/") || path.startsWith("/icons/") || path.startsWith("/models/");
          if (!keep.has(request.url) && !asset) await cache.delete(request);
        }
      }
      if (event.ports[0]) event.ports[0].postMessage({ ok: true });
    })(),
  );
});
