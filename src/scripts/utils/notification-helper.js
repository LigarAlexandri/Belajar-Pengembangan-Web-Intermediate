// src/scripts/utils/notification-helper.js
import { subscribeNotification, unsubscribeNotification } from '../data/api';
import CONFIG from '../config';

const NotificationHelper = {
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        await this._subscribePushNotification();
      } else {
        console.warn('Notification permission denied.');
      }
    } else {
      console.warn('Notifications not supported in this browser.');
    }
  },

  async _subscribePushNotification() {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Service Worker or Push API not supported.');
      return;
    }

    try {
      const swRegistration = await navigator.serviceWorker.getRegistration();
      if (!swRegistration) {
        console.warn('No active Service Worker registration found.');
        return;
      }

      const pushSubscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlB64ToUint8Array(CONFIG.WEB_PUSH_PUBLIC_KEY),
      });

      console.log('Push Subscription:', pushSubscription);

      const response = await subscribeNotification(pushSubscription.toJSON());
      console.log('Successfully subscribed to push notifications with API:', response);

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  },

  async unsubscribePushNotification() {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Service Worker or Push API not supported.');
      return;
    }

    try {
      const swRegistration = await navigator.serviceWorker.getRegistration();
      if (!swRegistration) return;

      const pushSubscription = await swRegistration.pushManager.getSubscription();
      if (pushSubscription) {
        await unsubscribeNotification(pushSubscription.endpoint);
        await pushSubscription.unsubscribe();
        console.log('Successfully unsubscribed from push notifications.');
      } else {
        console.log('No active push subscription found.');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  },

  _urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
};

export default NotificationHelper;