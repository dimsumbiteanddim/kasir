// ===================================================
// 1. IMPORT ONESIGNAL SERVICE WORKER (Wajib di Atas)
// ===================================================
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// ===================================================
// 2. KODE PWA (OFFLINE CACHE & FETCH)
// ===================================================
const CACHE_NAME = 'biteanddim-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
  // Tambahkan file CSS/JS/Gambar lokal kamu di sini jika ada
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

// Event Fetch PWA (Agar PWA bisa dibuka offline)
self.addEventListener('fetch', (event) => {
  // 1. Abaikan request Non-GET (POST, PUT, DELETE, dll)
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Abaikan request ke domain eksternal seperti OneSignal & Google
  if (event.request.url.includes('onesignal.com') || event.request.url.includes('google')) {
    return;
  }

  // 3. Proses Caching untuk aset internal
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
