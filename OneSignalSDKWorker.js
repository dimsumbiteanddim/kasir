// ===================================================
// 1. IMPORT ONESIGNAL SERVICE WORKER (Wajib di Atas)
// ===================================================
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// ===================================================
// 2. KODE PWA (OFFLINE CACHE & FETCH)
// ===================================================
const CACHE_NAME = 'biteanddim-v2'; // Naikkan versi cache jika update kodingan
const ASSETS_TO_CACHE = [
  '/kasir/',
  '/kasir/index.html',
  '/kasir/manifest.json',
  '/kasir/favicon.png'
];

// Event Install PWA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA] Membuka cache dan menyimpan aset');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Event Activate PWA
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA] Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Event Fetch PWA (Network First, Fallback to Cache)
self.addEventListener('fetch', (event) => {
  // 1. Abaikan request Non-GET (POST, PUT, DELETE, dll)
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Abaikan request ke domain eksternal (OneSignal, Google, Apps Script)
  const url = event.request.url;
  if (
    url.includes('onesignal.com') || 
    url.includes('script.google.com') || 
    url.includes('googleapis.com')
  ) {
    return;
  }

  // 3. Strategi Fetch: Utamakan Jaringan, jika offline gunakan Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika berhasil dapat data dari internet, perbarui cache secara dinamis
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika offline / koneksi terputus, ambil dari cache
        return caches.match(event.request);
      })
  );
});
