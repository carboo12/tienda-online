
"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Bell } from "lucide-react"
import { logout, getCurrentUser, User as AuthUser } from "@/lib/auth";
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, onSnapshot, orderBy, writeBatch, doc } from 'firebase/firestore';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

interface Notification {
    id: string;
    message: string;
    createdAt: Date;
    isRead: boolean;
    link?: string;
    type?: string;
}

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const isSuperUser = user.name?.toLowerCase() === 'admin' || user.role === 'Superusuario';
    const isStoreAdmin = user.role === 'Administrador de Tienda';
    if (!isSuperUser && !isStoreAdmin) return;
    
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    
    let q;
    if (isSuperUser) {
      q = query(
          collection(db, 'notifications'), 
          orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
          collection(db, 'notifications'), 
          where('storeId', '==', user.storeId),
          orderBy('createdAt', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate()
        } as Notification));
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
    }, (error) => {
        console.error("Error fetching notifications:", error);
    });

    return () => unsubscribe();

  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const markAllAsRead = async () => {
     if (unreadCount === 0) return;

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const batch = writeBatch(db);
    notifications.forEach(notif => {
        if (!notif.isRead) {
            const notifRef = doc(db, 'notifications', notif.id);
            batch.update(notifRef, { isRead: true });
        }
    });
    try {
        await batch.commit();
    } catch (error) {
        console.error("Error marking notifications as read:", error);
    }
  }

  if (!user || !user.name) {
    return null
  }

  const isSuperUser = user.name.toLowerCase() === 'admin' || user.role === 'Superusuario';
  const isStoreAdmin = user.role === 'Administrador de Tienda';
  const canViewNotifications = isSuperUser || isStoreAdmin;

  return (
    <div className="flex items-center gap-4">
        {canViewNotifications && (
            <DropdownMenu onOpenChange={(open) => { if(open && unreadCount > 0) markAllAsRead() }}>
                 <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
                       <Bell className="h-5 w-5" />
                       {unreadCount > 0 && (
                           <span className="absolute top-0 right-0 flex h-2.5 w-2.5 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                           </span>
                       )}
                       <span className="sr-only">Notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <DropdownMenuItem key={notif.id} className={cn("flex flex-col items-start gap-1 whitespace-normal rounded-lg", !notif.isRead && "bg-primary/5")} asChild>
                               <Link href={notif.link || '#'}>
                                  <p className="text-sm">{notif.message}</p>
                                  <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(notif.createdAt, { addSuffix: true, locale: es })}
                                  </p>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <DropdownMenuItem disabled>No hay notificaciones</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.role || (isSuperUser ? 'Superusuario' : 'Usuario de Tienda')}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )
}
