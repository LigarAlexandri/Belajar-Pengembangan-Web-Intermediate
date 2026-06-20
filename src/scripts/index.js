// src/scripts/index.js
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import NotificationHelper from './utils/notification-helper';
import L from 'leaflet';

// Import Leaflet default icon images
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Configure Leaflet's default icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  if ('serviceWorker' in navigator) {
    try {
      const swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', swRegistration.scope);

      if (Notification.permission === 'granted') {
        NotificationHelper.requestPermission();
      } else if (Notification.permission === 'default') {
        console.log('Notification permission is default. User can grant it later.');
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
});