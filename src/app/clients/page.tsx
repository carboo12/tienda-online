
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';
import { Loader2, PlusCircle, FilePenLine, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PaymentDialog } from '@/components/payment-dialog';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getCurrentUser, User as AuthUser } from '@/lib/auth';

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

interface Client {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  balance: number;
  creditLimit: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = getCurrentUser();

  const [clients, setClients] = useState<Client[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    let q;

    if (!user) {
        setIsDataLoading(false);
        return;
    }

    const isSuperUser = user.name === 'admin' || user.role === 'Superusuario';
    if (isSuperUser) {
      q = query(collection(db, 'clients'));
    } else if (user.storeId) {
      q = query(collection(db, 'clients'), where('storeId', '==', user.storeId));
    } else {
      // User is not a superuser and has no storeId, show no clients.
      setClients([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
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
            creditLimit: data.creditLimit,
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
  }, [router, toast, user]);

  const handleOpenPaymentDialog = (client: Client) => {
    setSelectedClient(client);
    setIsPaymentDialogOpen(true);
  };


  if (isDataLoading) {
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
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Gestión de Clientes</h1>
              <p className="text-muted-foreground text-sm md:text-base">
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
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                            <TableHead className="text-right">Saldo (C$)</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">{client.phone}</TableCell>
                            <TableCell className="text-right">{client.balance.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" onClick={() => handleOpenPaymentDialog(client)}>
                                    <Wallet className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/clients/edit/${client.id}`}>
                                        <FilePenLine className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
      </div>
       {selectedClient && (
            <PaymentDialog
                isOpen={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                client={selectedClient}
            />
        )}
    </AppShell>
  );
}
