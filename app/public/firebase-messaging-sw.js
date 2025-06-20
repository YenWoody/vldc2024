importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC2A8LLB7gGUzEcc0lyQGZrswhc-39KV0E",
  authDomain: "vldc-d0894.firebaseapp.com",
  databaseURL: "https://vldc-d0894-default-rtdb.firebaseio.com",
  projectId: "vldc-d0894",
  storageBucket: "vldc-d0894.firebasestorage.app",
  messagingSenderId: "843779421106",
  appId: "1:843779421106:web:f31c7c6763403a6bfdeaab"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Nhận thông báo nền:', payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: ''
  });
});
