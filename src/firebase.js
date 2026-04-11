// src/firebase.js

// 1. Imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// 2. Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAhIWGj1t9w9d00_Y1S7teWXoflWakzxTU",
  authDomain: "ai-integrated-rice-assistant.firebaseapp.com",
  databaseURL: "https://ai-integrated-rice-assistant-default-rtdb.firebaseio.com",
  projectId: "ai-integrated-rice-assistant",
  storageBucket: "ai-integrated-rice-assistant.firebasestorage.app",
  messagingSenderId: "1073641924738",
  appId: "1:1073641924738:web:137f753a2fc4fd5382ec9b",
  measurementId: "G-FT2E1JSLWV"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Exports
export const auth = getAuth(app);       // Authentication
export const db = getFirestore(app);    // Firestore (if needed)
export const storage = getStorage(app); // Storage
export const realtimeDb = getDatabase(app); // Realtime Database

export default app;