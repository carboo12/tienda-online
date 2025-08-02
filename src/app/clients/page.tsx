
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  balance: number;
}

export default function ClientsPage() {
  const { user, isLoading: isAuthLoading, app } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !app) {
      return;
    }
    
    setIsDataLoading(true);
    const db = getFirestore(app);
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const clientsData: Client[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          clientsData.push({
            id: doc.id,
            name: data.name,
            phone: data.phone,
            idNumber: data.idNumber,
            balance: data.balance,
          });
        });
        setClients(clientsData);
        setIsDataLoading(false);
      }, 
      (error) => {
        console.error("Error fetching clients: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los clientes.',
        });
        setIsDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthLoading, router, toast, app]);


  if (isAuthLoading) {
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
              <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Clientes</h1>
              <p className="text-muted-foreground">
                Consulta y gestiona los clientes de tu negocio.
              </p>
            </div>
            <Button asChild>
              <Link href="/clients/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar
              </Link>
            </Button>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Clientes Registrados</CardTitle>
                <CardDescription>
                Esta es la lista de todos los clientes activos.
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
                        <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                        <TableHead className="hidden md:table-cell">Cédula</TableHead>
                        <TableHead className="text-right">Saldo (C$)</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{client.phone}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{client.idNumber}</TableCell>
                        <TableCell className="text-right">{client.balance.toFixed(2)}</TableCell>
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
