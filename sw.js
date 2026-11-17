// 온라인이면 항상 서버에 새 파일인지 물어보고(수정이 바로 반영되게), 오프라인일 때만 저장본을 쓴다.
// 20261117212916은 scripts/build.sh가 배포 번호로 바꾼다. 파일 주소에도 같은 번호가 붙는다.
const VERSION = '20261117212916';
const CACHE = `animal-puzzle-${VERSION}`;
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-512.png',
  'js/app.js', 'js/board.js', 'js/characters.js', 'js/fx.js', 'js/game.js', 'js/generator.js', 'js/home.js',
  'js/progress.js', 'js/rng.js', 'js/rules.js', 'js/solver.js', 'js/sound.js', 'js/store.js',
].map((path) => (/\.(js|css)$/.test(path) ? `${path}?v=${VERSION}` : path));

// 브라우저의 10분짜리 저장본을 거치면 옛 파일과 새 파일이 섞일 수 있어서, 항상 서버에 확인한다.
const fresh = (url, mode) => fetch(url, { cache: mode });

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(FILES.map((path) => fresh(path, 'reload').then((response) => {
        if (!response.ok) throw new Error(`${path} ${response.status}`);
        return cache.put(path, response);
      }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    fresh(request.url, 'no-cache')
      .then((response) => {
        const copy = response.clone();
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(request.url, copy));
        return response;
      })
      .catch(() => caches.match(request.url, { ignoreSearch: true })),
  );
});
