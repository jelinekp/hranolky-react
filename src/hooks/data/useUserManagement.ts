import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export type UserType = 'Admins' | 'AllowedUsers';

export function useUserManagement() {
  const [admins, setAdmins] = useState<string[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const unsubAdmins = onSnapshot(collection(db, 'Admins'),
      (snap) => {
        setAdmins(snap.docs.map(d => d.id));
      },
      (err) => {
        console.error("Error fetching admins:", err);
        setError(err);
      }
    );

    const unsubAllowed = onSnapshot(collection(db, 'AllowedUsers'),
      (snap) => {
        setAllowedUsers(snap.docs.map(d => d.id));
        setLoading(false); // Assume both load quickly, simplified loading state
      },
      (err) => {
        console.error("Error fetching allowed users:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubAdmins();
      unsubAllowed();
    };
  }, []);

  const addUser = async (type: UserType, email: string) => {
    if (!email) return;
    try {
      await setDoc(doc(db, type, email), {
        createdAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error(`Error adding user to ${type}:`, e);
      return false;
    }
  };

  const removeUser = async (type: UserType, email: string) => {
    try {
      await deleteDoc(doc(db, type, email));
      return true;
    } catch (e) {
      console.error(`Error removing user from ${type}:`, e);
      return false;
    }
  };

  return {
    admins,
    allowedUsers,
    loading,
    error,
    addUser,
    removeUser
  };
}
