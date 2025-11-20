
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCIbzZzlB3zxOul38CcKpvPKdweGHj4awE",
  authDomain: "geminiestimate.firebaseapp.com",
  databaseURL: "https://geminiestimate-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "geminiestimate",
  storageBucket: "geminiestimate.firebasestorage.app",
  messagingSenderId: "987831362544",
  appId: "1:987831362544:web:e7a73ca894ce2de1317335",
  measurementId: "G-WB26FC2Z2Q"
};

// Singleton initialization pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

export default app;
