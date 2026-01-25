import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import useGoogleAuth from '../hooks/auth/useGoogleAuth';
import type { User } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

type AuthValue = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAllowed: boolean;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useGoogleAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      // If no user, reset permissions
      if (!auth.user?.email) {
        setIsAdmin(false);
        setIsAllowed(false);
        setPermissionLoading(false);
        return;
      }

      setPermissionLoading(true);
      try {
        const email = auth.user.email;

        const HARDCODED_ADMINS = [
          'jelinekp6@gmail.com',
          'pavel.jelinek@jelinek.eu',
          'jelinekv007@gmail.com',
          'r2202.komenda@gmail.com',
          'jelinekd@gmail.com',
          'david.jelinek@jelinek.eu'
        ];

        const HARDCODED_ALLOWED = [
          'prirezovnajelinek@gmail.com',
          'sklad.vyrobam01@gmail.com'
        ];

        // Failsafe for hardcoded lists
        if (HARDCODED_ADMINS.includes(email)) {
          setIsAdmin(true);
          setIsAllowed(true);
          setPermissionLoading(false);
          return;
        }

        if (HARDCODED_ALLOWED.includes(email)) {
          setIsAdmin(false);
          setIsAllowed(true);
          setPermissionLoading(false);
          return;
        }

        // Parallel fetch
        const [adminDoc, allowedDoc] = await Promise.all([
          getDoc(doc(db, 'Admins', email)),
          getDoc(doc(db, 'AllowedUsers', email))
        ]);

        const adminExists = adminDoc.exists();
        const allowedExists = allowedDoc.exists();

        setIsAdmin(adminExists);
        // Admin is implicitly allowed
        setIsAllowed(allowedExists || adminExists);
      } catch (err) {
        console.error("Error checking permissions:", err);
        setIsAdmin(false);
        setIsAllowed(false); // Fail closed
      } finally {
        setPermissionLoading(false);
      }
    };

    if (!auth.loading) {
      checkPermissions();
    }
  }, [auth.user, auth.loading]);

  // Combine auth loading and permission loading
  // If not logged in, permissionLoading should essentially be ignored (it's set to false in the effect quickly, or we can logic it out)
  // But strictly: if auth.loading, we wait. If auth.user, we wait for permissionLoading.
  const combinedLoading = auth.loading || (!!auth.user && permissionLoading);

  const value: AuthValue = {
    ...auth,
    loading: combinedLoading,
    isAdmin,
    isAllowed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};