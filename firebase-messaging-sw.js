// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCCQCLViZj3r55Na7suZFjJwFgwWzl-YZo",
  authDomain: "notifications-34034.firebaseapp.com",
  projectId: "notifications-34034",
  storageBucket: "notifications-34034.firebasestorage.app",
  messagingSenderId: "337223798719",
  appId: "1:337223798719:web:2f9c9c00234e90f8a0db0a",
  measurementId: "G-70B9RVFL5B"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Recibido en background:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
