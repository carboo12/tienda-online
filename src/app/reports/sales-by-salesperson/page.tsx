
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { ArrowLeft, Loader2, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface SalespersonPerformance {
  name: string;
  totalSales: number;
  invoiceCount: number;
}

export default function SalesBySalespersonReportPage() {
  const { app, isAuthLoading } = useAuth();
  const [performance, setPerformance] = useState<SalespersonPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !app) return;

    const fetchSalesData = async () => {
      setIsLoading(true);
      const db = getFirestore(app);
      const invoicesSnapshot = await getDocs(query(collection(db, 'invoices')));
      
      const salesByPerson: { [key: string]: { totalSales: number, invoiceCount: number } } = {};

      invoicesSnapshot.forEach((doc) => {
        const invoice = doc.data();
        const salesperson = invoice.createdBy;
        if (salesperson) {
          if (salesByPerson[salesperson]) {
            salesByPerson[salesperson].totalSales += invoice.total;
            salesByPerson[salesperson].invoiceCount += 1;
          } else {
            salesByPerson[salesperson] = {
              totalSales: invoice.total,
              invoiceCount: 1,
            };
          }
        }
      });
      
      const aggregatedPerformance = Object.keys(salesByPerson).map(name => ({
        name,
        totalSales: salesByPerson[name].totalSales,
        invoiceCount: salesByPerson[name].invoiceCount,
      }));

      // Sort by total sales descending
      aggregatedPerformance.sort((a, b) => b.totalSales - a.totalSales);
      
      setPerformance(aggregatedPerformance);
      setIsLoading(false);
    };

    fetchSalesData();
  }, [app, isAuthLoading]);
  
  return (
    <AppShell>
      <div className="flex w-full flex-col gap-6" id="report-page">
        <div className="no-print">
          <Button variant="outline" size="sm" asChild>
            <Link href="/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Informes
            </Link>
          </Button>
        </div>
        
        <Card id="report-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline">Informe de Ventas por Vendedor</CardTitle>
            <CardDescription>Rendimiento de los vendedores basado en el total facturado y el número de facturas.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : performance.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50 text-center p-4">
                    <UserCheck className="h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Sin Datos de Ventas</h3>
                    <p className="text-muted-foreground">No hay facturas registradas por vendedores para analizar.</p>
                </div>
            ) : (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Vendedor</TableHead>
                      <TableHead className="text-right">Total Vendido (C$)</TableHead>
                      <TableHead className="text-right"># Facturas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right font-bold">C$ {item.totalSales.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.invoiceCount}</TableCell>
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
