self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('flappy-cache').then(function(cache) {
        return cache.addAll([
          '/',
          'flappy.js',
          'index.html',
          // Add any other files that need to be cached
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });