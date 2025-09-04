//client/main.js
import "/imports/startup/client";
import "/imports/startup/both";
import "sweetalert2/dist/sweetalert2.css";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "/imports/startup/client/index.js";
import { Meteor } from "meteor/meteor";

// 👉 import tĩnh
import {
  messaging,
  getToken,
  onMessage,
} from "../imports/firebase/firebase-messaging.js";

// ⚠️ Check WebView
function isWebView() {
  const ua = navigator.userAgent || "";
  return (
    window.flutter_inappwebview ||
    ua.includes("wv") ||
    /(iPhone|iPad|iPod).*AppleWebKit(?!.*Safari)/.test(ua) ||
    (window.webkit && window.webkit.messageHandlers)
  );
}

Meteor.startup(() => {
  if (isWebView()) {
    console.warn(
      "🚫 Đang chạy trong WebView – không khởi tạo Firebase Messaging"
    );
    return;
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);
        initFCM(messaging, getToken, onMessage, registration);
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  }
});

function initFCM(messaging, getToken, onMessage, registration) {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      getToken(messaging, {
        vapidKey:
          "BLODi6dH9_w0rRP3b3_k_81pVM0QmhLMgzewRA5zNYgEv3S58yl-SV9UPjDQyl1wqr7K9lvalaGLQXwj_UupvaM",
        serviceWorkerRegistration: registration,
      })
        .then((token) => {
          if (token) {
            console.log("✅ FCM Token:", token);
            // Gửi token lên server nếu cần
          } else {
            console.warn("⚠️ Không lấy được token, cần cấp quyền");
          }
        })
        .catch((err) => {
          console.error("❌ Lỗi khi lấy token:", err);
        });
    } else {
      console.warn("⚠️ Người dùng không cho phép gửi thông báo");
    }
  });

  onMessage(messaging, (payload) => {
    console.log("📥 Nhận thông báo khi đang mở app:", payload);
    const title =
      payload.notification?.title || payload.data?.title || "Thông báo";
    const body = payload.notification?.body || payload.data?.body || "";
    const url = payload.data?.url || "https://earthquake.wemap.asia";
    if (confirm(`${title}\n${body}\n\n👉 Bạn có muốn mở chi tiết?`)) {
      window.location.href = url; // mở tab mới
    }
  });
}
