import { initializeApp } from "firebase/app";
import { getMessaging as _getMessaging, getToken as _getToken, onMessage as _onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC2A8LLB7gGUzEcc0lyQGZrswhc-39KV0E",
  authDomain: "vldc-d0894.firebaseapp.com",
  databaseURL: "https://vldc-d0894-default-rtdb.firebaseio.com",
  projectId: "vldc-d0894",
  storageBucket: "vldc-d0894.firebasestorage.app",
  messagingSenderId: "843779421106",
  appId: "1:843779421106:web:f31c7c6763403a6bfdeaab",
  measurementId: "G-6V5TCBXQPL"
};

function isWebView() {
  const ua = navigator.userAgent || '';
  return /wv/.test(ua) || /Android.*Version\/[\d.]+/.test(ua);
}

const app = initializeApp(firebaseConfig);

let messaging = null;
let getToken = null;
let onMessage = null;

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  messaging = _getMessaging(app);
  getToken = _getToken;
  onMessage = _onMessage;
} else {
  console.warn("🚫 WebView không hỗ trợ Firebase Messaging Web SDK");
}

export { messaging, getToken, onMessage };
