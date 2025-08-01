
"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import app from '@/lib/firebase';

export interface User {
  email: string | null;
  uid: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const auth = getAuth(app);

// Hardcoded master user credentials
const MASTER_USER = 'admin';
const MASTER_PASS = 'Id14304++';
const ADMIN_EMAIL = 'carboo12@gmail.com';
const ADMIN_UID = 'admin-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // If a local admin session is already active, don't overwrite it.
      if (user?.uid === ADMIN_UID) {
        setIsLoading(false);
        return;
      }
      
      if (firebaseUser) {
        setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []); // Removed `user` from dependencies to prevent re-renders

  const login = useCallback(async (username: string, pass: string) => {
    setIsLoading(true);
    if (username === MASTER_USER && pass === MASTER_PASS) {
      setUser({ email: ADMIN_EMAIL, uid: ADMIN_UID });
      setIsLoading(false);
      return;
    }

    try {
      const email = `${username.toLowerCase()}@example.com`;
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Firebase login error:", error);
      setIsLoading(false);
      throw new Error('Usuario o contraseña inválidos');
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
