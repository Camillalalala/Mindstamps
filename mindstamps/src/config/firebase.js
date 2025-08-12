import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyD7sSXAd_48n2k0t5213FhRJq08mE0iL-s",
  authDomain: "mindstamps.firebaseapp.com",
  databaseURL: "https://mindstamps-default-rtdb.firebaseio.com",
  projectId: "mindstamps",
  storageBucket: "mindstamps.firebasestorage.app",
  messagingSenderId: "916092227786",
  appId: "1:916092227786:web:a228777d4564bfc2aee433",
  measurementId: "G-1DF24XKH1T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;