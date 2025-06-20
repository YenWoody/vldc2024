// Client entry point, imports all client code
import "/imports/startup/client";
import "/imports/startup/both";
import "sweetalert2/dist/sweetalert2.css";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "/imports/startup/client/index.js";
import { Meteor } from 'meteor/meteor';
import { messaging, getToken, onMessage } from '/client/firebase-init';

Meteor.startup(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
        initFCM(registration);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  }
});

function initFCM(registration) {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      getToken(messaging, {
        vapidKey: "BLODi6dH9_w0rRP3b3_k_81pVM0QmhLMgzewRA5zNYgEv3S58yl-SV9UPjDQyl1wqr7K9lvalaGLQXwj_UupvaM",
        serviceWorkerRegistration: registration,
      }).then((token) => {
        if (token) {
          console.log('✅ FCM Token:', token);
          // 👉 Gửi token này lên server nếu cần
        } else {
          console.warn('⚠️ Không lấy được token, cần cấp quyền');
        }
      }).catch((err) => {
        console.error('❌ Lỗi khi lấy token:', err);
      });
    } else {
      console.warn('⚠️ Người dùng không cho phép gửi thông báo');
    }
  });

  onMessage(messaging, (payload) => {
    console.log('📥 Nhận thông báo khi đang mở app:', payload);
    alert(payload.notification.title + '\n' + payload.notification.body);
  });
}
