
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
    onAuthStateChanged, 
    signOut, 
    User, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/firebase/provider';

const adminEmails = ['royconstruction000@gmail.com'];

interface AuthState {
  user: User | null;
  loading: boolean;
  sessionRole: 'Admin' | 'Client' | null;
}

interface AuthContextType extends AuthState {
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  signInAsClient: (email: string, pass: string) => Promise<User | null>;
  updateUserProfile: (name: string, image: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore } = useFirebase();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    sessionRole: null,
  });

  const fetchUserRole = useCallback(async (firebaseUser: User | null): Promise<'Admin' | 'Client' | null> => {
    if (!firebaseUser || !firestore) return null;
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  }, [firestore]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Ensure firestore is initialized before fetching role
            if(firestore) {
                const role = await fetchUserRole(firebaseUser);
                setAuthState({ user: firebaseUser, sessionRole: role, loading: false });
            } else {
                // Firestore is not ready yet, keep loading
                setAuthState(prev => ({ ...prev, user: firebaseUser, loading: true }));
            }
        } else {
            setAuthState({ user: null, sessionRole: null, loading: false });
        }
    });

    return () => unsubscribe();
  }, [auth, firestore, fetchUserRole]);
  
  // This effect handles the case where auth loads first, but firestore is still initializing
  useEffect(() => {
      if(authState.user && !authState.sessionRole && firestore) {
          const checkRole = async () => {
              const role = await fetchUserRole(authState.user);
              if(role) {
                  setAuthState(prev => ({...prev, sessionRole: role, loading: false}));
              }
          };
          checkRole();
      }
  }, [authState.user, authState.sessionRole, firestore, fetchUserRole]);


  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);


  const signInAsClient = async (email: string, pass: string): Promise<User | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const role = await fetchUserRole(user);
    if (role !== 'Client') {
        await logout();
        throw new Error("This account is not registered as a client.");
    }
    // onAuthStateChanged will handle the state update
    return user;
  };


  const signInWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email || '';

      const isUserAdmin = adminEmails.includes(userEmail);
      if (!isUserAdmin) {
          await logout();
          throw new Error("Only admins can sign in with Google. Please use the Client login.");
      }
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
           await setDoc(userDocRef, {
              id: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              creationTime: serverTimestamp(),
              role: 'Admin'
          });
      }
      // onAuthStateChanged will handle the rest
      return user;
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (auth.currentUser) {
        await logout(); 
      }
      throw error;
    }
  };

  const updateUserProfile = async (name: string, image: File | null) => {
    if (!authState.user) throw new Error("Not authenticated");
    
    setAuthState(prev => ({ ...prev, loading: true }));
    let photoURL = authState.user.photoURL || '';
    
    if (image) {
      const storage = getStorage(auth.app);
      const storageRef = ref(storage, `profile-pictures/${authState.user.uid}/${image.name}`);
      const snapshot = await uploadBytes(storageRef, image);
      photoURL = await getDownloadURL(snapshot.ref);
    }
    
    await updateFirebaseProfile(authState.user, { displayName: name, photoURL });
    
    const userDocRef = doc(firestore, 'users', authState.user.uid);
    await setDoc(userDocRef, { displayName: name, photoURL }, { merge: true });
    
    // Manually update local user state to reflect changes immediately
    const role = await fetchUserRole(auth.currentUser);
    setAuthState({ user: auth.currentUser, sessionRole: role, loading: false });
  };

  const value = { ...authState, logout, signInWithGoogle, signInAsClient, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
