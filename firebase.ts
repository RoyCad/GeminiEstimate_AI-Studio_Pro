
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Initialize Firestore with persistence settings
let firestoreInstance;
try {
    // Check if we are in a browser environment to enable persistence
    if (typeof window !== 'undefined') {
        firestoreInstance = initializeFirestore(app, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
    } else {
        firestoreInstance = getFirestore(app);
    }
} catch (e) {
    console.warn("Firestore persistence could not be enabled, falling back to default.", e);
    firestoreInstance = getFirestore(app);
}
export const firestore = firestoreInstance;

// Initialize Analytics conditionally (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
export default app;
