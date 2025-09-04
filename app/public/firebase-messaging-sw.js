importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyC2A8LLB7gGUzEcc0lyQGZrswhc-39KV0E",
  authDomain: "vldc-d0894.firebaseapp.com",
  databaseURL: "https://vldc-d0894-default-rtdb.firebaseio.com",
  projectId: "vldc-d0894",
  storageBucket: "vldc-d0894.firebasestorage.app",
  messagingSenderId: "843779421106",
  appId: "1:843779421106:web:f31c7c6763403a6bfdeaab",
});

const messaging = firebase.messaging();

// Nhận thông báo khi app ở background
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Nhận thông báo nền:", payload);
  const title = payload.data?.title || "Thông báo";
  const body = payload.data?.body || "Có trận động đất mới";
  const url = payload.data?.url || "https://earthquake.wemap.asia";
  self.registration.showNotification(title, {
    body,
    icon: "https://earthquake.wemap.asia/img/station.png",
    data: { url },
  });
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  console.log(event.notification.data.url, "event.notification.data.url");
  const targetUrl =
    event.notification.data?.url || "https://earthquake.wemap.asia";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
