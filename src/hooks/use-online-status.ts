
'use client';

import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  // Check for navigator availability for SSR compatibility
  const getInitialStatus = () => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    // Default to true on the server or in environments without navigator
    return true;
  };

  const [isOnline, setIsOnline] = useState(getInitialStatus);

  useEffect(() => {
    // Ensure window object is available
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
