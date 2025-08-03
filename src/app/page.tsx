
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Bot } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only perform redirection logic once the auth state is resolved
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  // While loading, show a full-screen loader. This is the app's entry point.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
       <Bot className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
