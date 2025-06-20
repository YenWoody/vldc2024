import admin from 'firebase-admin';
import serviceAccount from './firebase-service-account.json'; // ✅ Đặt cùng thư mục

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Gửi notification đến topic FCM
 * @param {string} topic - Tên topic (ví dụ: 'earthquake')
 * @param {string} title - Tiêu đề thông báo
 * @param {string} body - Nội dung thông báo
 */
export function sendNotificationToTopic(topic, title, body, data = {}) {
  return admin.messaging().send({
    topic,
    notification: {
      title,
      body
    },
    data
  });
}

/**
 * Gắn token vào topic
 * @param {string} token - FCM token
 * @param {string} topic - tên topic để subscribe
 */
export function subscribeToTopic(token, topic) {
  return admin.messaging().subscribeToTopic([token], topic);
}  
/**
 * Hủy đăng ký FCM token khỏi một topic
 * @param {string} token 
 * @param {string} topic 
 */
export function unsubscribeFromTopic(token, topic) {
  return admin.messaging().unsubscribeFromTopic([token], topic);
}