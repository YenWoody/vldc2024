// firebase-messaging.js
import { app } from './firebase-init.js';
import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";

const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
