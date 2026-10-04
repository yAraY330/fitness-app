const CACHE = 'fitness-v18';
const MEDIA_CACHE = 'fitness-media-v1';
const ASSETS = ['./', './index.html', './css/style.css', './js/app.js', './js/avatar.js',
  './js/engine.js', './js/exercise-map.js', './js/exercise-index.js', './js/anim.js', './manifest.json',
  './assets/fonts/Cubic_11.woff2',
  './assets/icons/arrow-left.svg', './assets/icons/barbell.svg', './assets/icons/bike.svg', './assets/icons/calendar.svg',
  './assets/icons/chart-bar.svg', './assets/icons/chart-line.svg', './assets/icons/check.svg', './assets/icons/download.svg',
  './assets/icons/home.svg', './assets/icons/notes.svg', './assets/icons/run.svg', './assets/icons/stopwatch.svg',
  './assets/icons/swimming.svg', './assets/icons/trash.svg', './assets/icons/trees.svg', './assets/icons/upload.svg',
  './assets/icons/user.svg', './assets/icons/x.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE && k !== MEDIA_CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // 示範媒體（本地資料集 GIF/縮圖與遠端示範圖）：用戶實際看過才快取（cache-on-use），
  // 1,324 個 GIF 絕不預快取
  if (url.includes('/exercises-dataset/') || url.startsWith('https://raw.githubusercontent.com')) {
    e.respondWith(
      caches.open(MEDIA_CACHE).then(c =>
        c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
          if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone());
          return res;
        }))
      ).catch(() => fetch(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
