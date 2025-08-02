
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

// FAKE DATA
const invoices = [
    { id: 'INV-001', client: 'John Doe', date: '2024-05-01', total: 150.75, status: 'Pagada' },
    { id: 'INV-002', client: 'Jane Smith', date: '2024-05-03', total: 300.00, status: 'Pendiente' },
    { id: 'INV-003', client: 'Tech Corp', date: '2024-05-05', total: 1250.50, status: 'Vencida' },
];


export default function InvoicesPage() {
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
          <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No hay facturas para mostrar.</p>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Aquí iría la paginación.</p>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
