// src/hooks/signInAnonymously.ts

import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        try {
          // Sign in anonymously; onAuthStateChanged will fire again upon success
          await signInAnonymously(auth);
        } catch (e) {
          if (!isMounted) return;
          setError(e as Error);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading, error };
}

export default useAnonymousAuth;
