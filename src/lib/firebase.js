import { initializeApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAMplxTm0AIrwcubutOG5kPH9tQi69zRAE",
  authDomain: "vedmantra-b1031.firebaseapp.com",
  projectId: "vedmantra-b1031",
  storageBucket: "vedmantra-b1031.firebasestorage.app",
  messagingSenderId: "649288027186",
  appId: "1:649288027186:web:379c940bddd36ec8c8402b",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export { RecaptchaVerifier };