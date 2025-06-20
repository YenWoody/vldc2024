// 📁 client-init-fcm.js

import { messaging } from './firebase-init';
import { getToken, onMessage } from "firebase/messaging";

// Optional: xử lý thông báo foreground
onMessage(messaging, (payload) => {
  console.log("📨 Nhận thông báo khi đang mở:", payload);
});

export { messaging, getToken };
