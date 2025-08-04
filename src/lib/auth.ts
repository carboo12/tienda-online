
'use client';

export interface User {
  name: string;
  role?: string;
  storeId?: string | null;
}

const USER_STORAGE_KEY = 'multishop_user';

export function login(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  }
  return null;
}
