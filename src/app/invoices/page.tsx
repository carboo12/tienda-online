
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  clientName: string;
  createdAt: Date;
  total: number;
  status: string;
}

export default function InvoicesPage() {
  const { app, isAuthLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !app) return;

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
        };
      });
      setInvoices(invoicesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching invoices:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [app, isAuthLoading]);

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
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Facturación</h1>
            <p className="text-muted-foreground">Gestiona y sigue todas tus facturas.</p>
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
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">...{invoice.id.slice(-6)}</TableCell>
                      <TableCell className="font-medium">{invoice.clientName}</TableCell>
                      <TableCell>{format(invoice.createdAt, "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">C$ {invoice.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
