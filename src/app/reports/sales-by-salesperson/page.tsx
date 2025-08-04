
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Loader2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getCurrentUser } from '@/lib/auth';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


interface SalespersonPerformance {
  name: string;
  totalSales: number;
  invoiceCount: number;
}

export default function SalesBySalespersonReportPage() {
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);
  const [performance, setPerformance] = useState<SalespersonPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);

  useEffect(() => {
    if (!app || !user) return;

    const fetchSalesData = async () => {
      setIsLoading(true);
      const db = getFirestore(app);
      
      let q;
      const isSuperUser = user?.name === 'admin' || user?.role === 'Superusuario';
      if (isSuperUser) {
          q = query(collection(db, 'invoices'));
      } else if (user?.storeId) {
          q = query(collection(db, 'invoices'), where('storeId', '==', user.storeId));
      } else {
          setIsLoading(false);
          return;
      }
      const invoicesSnapshot = await getDocs(q);
      
      const salesByPerson: { [key: string]: { totalSales: number, invoiceCount: number } } = {};

      invoicesSnapshot.forEach((doc) => {
        const invoice = doc.data();
        const salesperson = invoice.createdBy;
        const total = invoice.total || 0;

        if (salesperson) {
          if (salesByPerson[salesperson]) {
            salesByPerson[salesperson].totalSales += total;
            salesByPerson[salesperson].invoiceCount += 1;
          } else {
            salesByPerson[salesperson] = {
              totalSales: total,
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
  }, [app, user]);
  
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
