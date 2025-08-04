
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, onSnapshot, query, doc, getDoc, initializeFirestore } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    storeId?: string | null;
    storeName: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);

  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsAuthLoading(false);
  }, [app]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (user?.name !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isAuthLoading, router]);


  useEffect(() => {
    if (user?.name !== 'admin' || !app) return;

    const db = getFirestore(app);
    const unsubscribe = onSnapshot(query(collection(db, 'users')), async (snapshot) => {
      setIsDataLoading(true);
      const usersData: User[] = [];
      for (const userDoc of snapshot.docs) {
          const data = userDoc.data();
          let storeName = 'Sin Asignar (Demo)';

          if (data.storeId) {
            try {
              const storeDocRef = doc(db, 'stores', data.storeId);
              const storeDoc = await getDoc(storeDocRef);
              if (storeDoc.exists()) {
                storeName = storeDoc.data().name;
              } else {
                storeName = 'Tienda Eliminada';
              }
            } catch (error) {
              console.error("Error fetching store name:", error);
              storeName = 'Error al cargar';
            }
          }
           usersData.push({
              id: userDoc.id,
              name: data.name,
              email: data.email,
              role: data.role,
              storeId: data.storeId,
              storeName: storeName
          });
      }
      setUsers(usersData);
      setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, app]);

  if (isAuthLoading || user?.name !== 'admin') {
    return (
      <AppShell>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Añade, edita y gestiona los usuarios del sistema.
            </p>
          </div>
           <Button asChild>
              <Link href="/users/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Usuario
              </Link>
            </Button>
        </div>
        
        <Card>
            <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
                <CardDescription>
                Esta es la lista de todos los usuarios registrados en el sistema.
            </CardDescription>
            </CardHeader>
            <CardContent>
                {isDataLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden sm:table-cell">Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="hidden md:table-cell">Tienda</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{user.storeName}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
