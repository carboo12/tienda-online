
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (username: string, pass:string) => {
    try {
      let email: string;
      // The admin user logs in with the username 'admin', but the email in Firebase is 'admin@example.com'.
      if (username.toLowerCase() === 'admin') {
        email = 'admin@example.com';
      } else {
        // For other users, we construct the email from the username.
        email = `${username}@example.com`;
      }
      // We always use the provided password. Ensure this password matches the one in Firebase for the corresponding email.
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Firebase login error:", error);
      // This error is thrown if the credentials do not match what's in Firebase.
      throw new Error('Usuario o contraseña inválidos');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
