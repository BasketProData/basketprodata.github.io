/* Guarda la app en el dispositivo para que abra sin señal. Los DATOS se guardan aparte (en index.html).
   Estrategia: primero la red (así las mejoras llegan solas) y, si no hay señal, la copia guardada. */
var V = 'bpl-v35';
var BASE = ['./', 'index.html', 'completa.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;               // los datos (Supabase) no pasan por acá
  e.respondWith(
    fetch(r).then(function (res) {
      var copia = res.clone();
      caches.open(V).then(function (c) { c.put(r, copia); });
      return res;
    }).catch(function () {
      return caches.match(r).then(function (m) { return m || caches.match('index.html'); });
    })
  );
});
