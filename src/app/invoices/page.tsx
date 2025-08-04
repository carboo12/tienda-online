
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Loader2, CreditCard, Coins } from 'lucide-react';
import Link from 'next/link';
import { getFirestore, collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { cn } from '@/lib/utils';

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

interface Invoice {
  id: string;
  clientName: string;
  createdAt: Date;
  total: number;
  status: string;
  paymentMethod: 'credit' | 'cash';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    setIsLoading(true);
    const db = getFirestore(app);
    const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clientName: data.clientName,
          createdAt: (data.createdAt as Timestamp).toDate(),
          total: data.total,
          status: data.status,
          paymentMethod: data.paymentMethod || 'credit',
        };
      });
      setInvoices(invoicesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching invoices:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pagada': return 'default';
      case 'pendiente': return 'secondary';
      case 'vencida': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <AppShell>
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Facturación</h1>
            <p className="text-muted-foreground text-sm md:text-base">Gestiona y sigue todas tus facturas.</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Factura
          </Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
          <CardDescription>Aquí se mostrará una lista de las facturas recientes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : invoices.length === 0 ? (
            <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground">No hay facturas para mostrar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Estado</TableHead>
                    <TableHead className="text-center">Tipo Venta</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs">...{invoice.id.slice(-6)}</TableCell>
                      <TableCell className="font-medium">{invoice.clientName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{format(invoice.createdAt, "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn(invoice.paymentMethod === 'cash' ? "border-green-500" : "border-sky-500")}>
                           {invoice.paymentMethod === 'cash' ? <Coins className="mr-1" /> : <CreditCard className="mr-1" />}
                           {invoice.paymentMethod === 'cash' ? 'Contado' : 'Crédito'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">C$ {invoice.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {invoices.length > 0 && (
          <CardFooter>
              <p className="text-xs text-muted-foreground">Mostrando las últimas {invoices.length} facturas.</p>
          </CardFooter>
        )}
      </Card>
    </AppShell>
  );
}
