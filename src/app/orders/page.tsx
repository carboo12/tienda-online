
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getFirestore, collection, onSnapshot, query, limit, initializeFirestore } from 'firebase/firestore';
import { Loader2, PlusCircle, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApp, getApps, initializeApp } from 'firebase/app';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


export default function OrdersPage() {
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);
  const [hasClients, setHasClients] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);

  useEffect(() => {
    if (!app) {
      return;
    }

    const db = getFirestore(app);
    // Query for just one client to check for existence, which is more efficient
    const q = query(collection(db, 'clients'), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setHasClients(!snapshot.empty);
        setIsLoading(false);
    }, (error) => {
        console.error("Error checking for clients:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();

  }, [app]);

  if (isLoading) {
    return (
        <AppShell>
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </AppShell>
    );
  }

  if (!hasClients) {
    return (
         <AppShell>
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <UsersRound className="h-6 w-6" />
                            No hay Clientes Registrados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Para crear un pedido, primero debes registrar un cliente en el sistema.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/clients/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Registrar Cliente
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Pedidos</h1>
            <p className="text-muted-foreground text-sm md:text-base">Sigue y gestiona los pedidos de los clientes.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Pedido
        </Button>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>Aquí se mostrará una lista de los pedidos recientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No hay pedidos para mostrar.</p>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Aquí iría la paginación.</p>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
