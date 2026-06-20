// src/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  const data = event.data.json();
  const title = data.title || 'Notification';
  const options = {
    body: data.options.body || 'You have a new message.',
    icon: '/favicon.png',
    badge: '/favicon.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://story-api.dicoding.dev/')
  );
});