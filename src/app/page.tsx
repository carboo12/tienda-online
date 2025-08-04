
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // This logic will now be primarily handled by the AppShell's layout effect
    // to prevent race conditions. This page serves as the initial loading entry point.
    if (getCurrentUser()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // While loading/redirecting, show a full-screen loader.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
       <Bot className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
