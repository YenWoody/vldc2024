import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC2A8LLB7gGUzEcc0lyQGZrswhc-39KV0E",
  authDomain: "vldc-d0894.firebaseapp.com",
  databaseURL: "https://vldc-d0894-default-rtdb.firebaseio.com",
  projectId: "vldc-d0894",
  storageBucket: "vldc-d0894.appspot.com", // ✅ Sửa lại ở đây
  messagingSenderId: "843779421106",
  appId: "1:843779421106:web:f31c7c6763403a6bfdeaab"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
