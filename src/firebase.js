// src/firebase.js

// 1. Imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 2. Aapka Config Code (Isko apne copy kiye hue code se replace karein)
const firebaseConfig = {
  apiKey: "AIzaSyAhIWGj1t9w9d00_Y1S7teWXoflWakzxTU",
  authDomain: "ai-integrated-rice-assistant.firebaseapp.com",
  projectId: "ai-integrated-rice-assistant",
  storageBucket: "ai-integrated-rice-assistant.firebasestorage.app",
  messagingSenderId: "1073641924738",
  appId: "1:1073641924738:web:137f753a2fc4fd5382ec9b",
  measurementId: "G-FT2E1JSLWV"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Exports (Taake hum poori app mein use kar sakein)
export const auth = getAuth(app);       // Login ke liye
export const db = getFirestore(app);    // Database ke liye
export const storage = getStorage(app); // Images upload karne ke liye

export default app;