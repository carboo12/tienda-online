
"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

// Centralized Firebase Configuration
const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

// This will be initialized on the client
let app: FirebaseApp;

export interface User {
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  app: FirebaseApp | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'multishop_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Initialize Firebase only on the client side
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    setFirebaseApp(app);

    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((user: User) => {
    setUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, app: firebaseApp }}>
      {children}
    </AuthContext.Provider>
  );
}
