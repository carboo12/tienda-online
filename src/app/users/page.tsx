
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    storeId?: string | null;
    storeName: string;
}

export default function UsersPage() {
  const { user, isLoading: isAuthLoading, app } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
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
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Tienda</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-muted-foreground">{user.storeName}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
