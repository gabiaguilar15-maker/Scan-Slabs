// Guarda la app y sus librerías para que funcione sin cobertura en el almacén.
const CACHE = "gabriel-inventario-v25";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./logo.png", "./logo-blanco.png", "./config.js",
  "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // lo propio de la app se pide siempre fresco (sin la caché de 10 min del navegador)
  const propio = new URL(e.request.url).origin === self.location.origin;
  const req = propio ? new Request(e.request.url, { cache: "no-cache" }) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request))
  );
});
