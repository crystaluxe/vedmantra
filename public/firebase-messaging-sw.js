importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAMplxTm0AIrwcubutOG5kPH9tQi69zRAE",
  authDomain: "vedmantra-b1031.firebaseapp.com",
  projectId: "vedmantra-b1031",
  storageBucket: "vedmantra-b1031.firebasestorage.app",
  messagingSenderId: "649288027186",
  appId: "1:649288027186:web:379c940bddd36ec8c8402b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/favicon.ico",
    }
  );
});