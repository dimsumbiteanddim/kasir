// Gantilah nama/versi cache setiap kali ada perubahan ikon, gambar, atau file web
const CACHE_NAME = 'bite-and-dim-v4'; // Up ke v4

// Daftar file yang akan disimpan dalam cache offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './favicon.png'
]; // manifest.json kita keluarkan dari static cache agar selalu segar dari server

// 1. EVENT INSTALL: Simpan file ke cache dan paksa Service Worker baru langsung aktif
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Memasang cache baru:', CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Langsung timpa SW lama
  );
});

// 2. EVENT ACTIVATE: Hapus semua cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung kendalikan semua tab/PWA
  );
});

// 3. EVENT FETCH
self.addEventListener('fetch', (event) => {
  // KHUSUS MANIFEST.JSON: Selalu ambil dari Network (Server), Jangan simpan/ambil dari Cache!
  if (event.request.url.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // UNTUK FILE LAIN: Network First, Fallback ke Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Hanya simpan jika response valid (abaikan cek type 'basic' yang bikin macet)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(event.request);
      })
  );
});
