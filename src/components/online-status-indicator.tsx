
'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          isOnline ? 'bg-green-500' : 'bg-red-500'
        )}
      />
      <span className="text-sm text-muted-foreground">
        {isOnline ? 'En Línea' : 'Sin Conexión'}
      </span>
    </div>
  );
}
