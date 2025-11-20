
'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseStorage, getStorage } from "firebase/storage";
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { firebaseConfig } from './config';
import { Loader2 } from 'lucide-react';

interface FirebaseProviderProps {
  children: ReactNode;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [services, setServices] = useState<FirebaseContextState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebaseServices = async () => {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      let storage: FirebaseStorage;
      let db: Firestore;

      try {
          storage = getStorage(app);
      } catch(e: any) {
          console.error("Firebase Storage service is not available.", e);
          setError("Storage service failed to initialize.");
          storage = {} as FirebaseStorage; // Dummy storage
      }

      if (typeof window !== 'undefined') {
        try {
            // Use the recommended initializeFirestore with localCache setting
            db = initializeFirestore(app, {
                localCache: { kind: 'persistent' }
            });
        } catch (err: any) {
            let message = `Error enabling Firebase persistence: ${err.message}`;
            if (err.code === 'failed-precondition') {
                message = 'Firestore persistence failed. Multiple tabs open, persistence can only be enabled in one tab at a time.';
            } else if (err.code === 'unimplemented') {
                message = 'Firestore persistence failed. The current browser does not support all of the features required to enable persistence.';
            }
            console.warn(message, err);
            setError(message);
            // Fallback to in-memory firestore instance if persistence fails
            db = getFirestore(app);
        }
      } else {
        // For SSR, use standard getFirestore
        db = getFirestore(app);
      }

      setServices({ firebaseApp: app, firestore: db, auth, storage });
    };

    initializeFirebaseServices();
  }, []);

  if (!services) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-muted-foreground">Initializing Database...</p>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        </div>
    );
  }

  return (
    <FirebaseContext.Provider value={services}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};
