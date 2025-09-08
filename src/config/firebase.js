import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD7sSXAd_48n2k0t5213FhRJq08mE0iL-s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mindstamps.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mindstamps",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "916092227786",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:916092227786:web:a228777d4564bfc2aee433",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1DF24XKH1T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;