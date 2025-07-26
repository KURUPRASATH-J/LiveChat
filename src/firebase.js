// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // ✅ Realtime DB
import { getStorage } from "firebase/storage";   // ✅ Storage for image/file upload

// ✅ Firebase configuration with RTDB URL
const firebaseConfig = {
  apiKey: "AIzaSyDmlMaJtefhzUkfizXmAq9_w9q-XFFuDv8",
  authDomain: "realtimechatapp-123.firebaseapp.com",
  projectId: "realtimechatapp-123",
  storageBucket: "realtimechatapp-123.appspot.com",
  messagingSenderId: "418402014835",
  appId: "1:418402014835:web:78a428c6330b273f1abc06",
  measurementId: "G-ZT203ZBEP2",
  databaseURL: "https://realtimechatapp-123-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app); // ✅ Add this line for file/image uploads
