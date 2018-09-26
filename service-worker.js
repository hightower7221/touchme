var dataCacheName = 'touchme-v1';
var cacheName = 'touchme-final-1';
var filesToCache = [
  '/touchme/index.html',
  '/touchme/scripts/app.js',
  '/touchme/scripts/fp.js',
  '/touchme/styles/inline.css',
  '/touchme/images/grid.jpg',
  '/touchme/images/ic_add_white_24px.svg',
  '/touchme/images/ic_refresh_white_24px.svg'

];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return cache.delete(key);
        }
      }));
    })
  );

  return self.clients.claim();
});

self.addEventListener('message',  function(e) {
  console.log('[ServiceWorker] message received:' + e.data);
  if(e.data.msg == "clearCache")
  {
      e.waitUntil(
        caches.open(cacheName).then(function(cache) {


          for (let name of filesToCache)
          {
            console.log('[ServiceWorker] delete from cache: ' + name );
            caches.delete(name);
          }

        })
      );
  }
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://back-back.a3c1.starter-us-west-1.openshiftapps.com/';
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
