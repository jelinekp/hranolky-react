import { createContext, useContext, ReactNode } from 'react';
import useAnonymousAuth from '../hooks/signInAnonymously';

type AuthValue = {
  user: any | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAnonymousAuth();
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};