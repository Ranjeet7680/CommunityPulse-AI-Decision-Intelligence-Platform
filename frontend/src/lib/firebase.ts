import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjV7lk9JhOkUJFxvdTTaf0Xjvqkv0YCjQ",
  authDomain: "ranjeet-13b42.firebaseapp.com",
  projectId: "ranjeet-13b42",
  storageBucket: "ranjeet-13b42.firebasestorage.app",
  messagingSenderId: "100844466758",
  appId: "1:100844466758:web:008d1cd8e4f33ea9671047",
  measurementId: "G-K1NQ1C4Q2W"
};

// Initialize Firebase App (avoid duplicate initialization in Next.js hot-reloads)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// Initialize Analytics dynamically (client-side only)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics is not supported in this environment:", err);
  });
}

export { app, auth, googleProvider, microsoftProvider, analytics };
