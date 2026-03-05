// src/hooks/useGoogleAuth.ts

import { useEffect, useState, useCallback } from 'react';
import { auth } from '../../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  type User,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Set persistence to LOCAL (survives browser restart)
    setPersistence(auth, browserLocalPersistence).catch((e) => {
      console.error('Failed to set auth persistence:', e);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;

      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if we should force account selection (e.g., after logout)
      const forceSelect = sessionStorage.getItem('forceSelectAccount') === 'true';
      if (forceSelect) {
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
        sessionStorage.removeItem('forceSelectAccount');
      } else {
        googleProvider.setCustomParameters({});
      }

      await signInWithPopup(auth, googleProvider);
      // Success will be handled by onAuthStateChanged, but let's be safe
      setLoading(false);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      console.error('Sign-in error:', err.code, err.message);

      // If user closed the popup, don't show it as a persistent error
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-by-user') {
        setError(null);
        // Put the flag back so next time it still prompts (since we removed it in try block)
        sessionStorage.setItem('forceSelectAccount', 'true');
      } else {
        setError(e as Error);
      }

      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Flag that the next sign-in should prompt for account selection
      sessionStorage.setItem('forceSelectAccount', 'true');
      await firebaseSignOut(auth);
    } catch (e) {
      setError(e as Error);
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}

export default useGoogleAuth;
