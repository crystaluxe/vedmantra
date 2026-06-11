import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAMplxTm0AIrwcubutOG5kPH9tQi69zRAE",
  authDomain: "vedmantra-b1031.firebaseapp.com",
  projectId: "vedmantra-b1031",
  storageBucket: "vedmantra-b1031.firebasestorage.app",
  messagingSenderId: "649288027186",
  appId: "1:649288027186:web:379c940bddd36ec8c8402b",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const requestFcmToken = async () => {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.log("Firebase messaging is not supported in this browser.");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission not granted.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.error("FCM_TOKEN_ERROR", error);
    return null;
  }
};