// firebase-init.js
import { initializeApp } from "firebase/app";

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

const app = initializeApp(firebaseConfig);

export { app };
