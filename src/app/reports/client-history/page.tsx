
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFirestore, collection, getDocs, query, initializeFirestore } from 'firebase/firestore';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { getApp, getApps, initializeApp } from 'firebase/app';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


interface ClientHistory {
  clientId: string;
  clientName: string;
  totalSpent: number;
  invoiceCount: number;
}

export default function ClientHistoryReportPage() {
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);
  const [history, setHistory] = useState<ClientHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);

  useEffect(() => {
    if (!app) return;

    const fetchClientHistory = async () => {
      setIsLoading(true);
      const db = getFirestore(app);
      const invoicesSnapshot = await getDocs(query(collection(db, 'invoices')));
      
      const clientData: { [key: string]: { name: string, totalSpent: number, invoiceCount: number } } = {};

      invoicesSnapshot.forEach((doc) => {
        const invoice = doc.data();
        const clientId = invoice.clientId;
        const clientName = invoice.clientName;
        const total = invoice.total || 0;

        if (clientId) {
            if (clientData[clientId]) {
                clientData[clientId].totalSpent += total;
                clientData[clientId].invoiceCount += 1;
            } else {
                clientData[clientId] = {
                    name: clientName,
                    totalSpent: total,
                    invoiceCount: 1,
                };
            }
        }
      });
      
      const aggregatedHistory = Object.keys(clientData).map(clientId => ({
        clientId,
        clientName: clientData[clientId].name,
        totalSpent: clientData[clientId].totalSpent,
        invoiceCount: clientData[clientId].invoiceCount,
      }));

      // Sort by total spent descending
      aggregatedHistory.sort((a, b) => b.totalSpent - a.totalSpent);
      
      setHistory(aggregatedHistory);
      setIsLoading(false);
    };

    fetchClientHistory();
  }, [app]);
  
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
            <CardTitle className="text-2xl font-bold font-headline">Historial de Compras por Cliente</CardTitle>
            <CardDescription>Analiza el valor total y la frecuencia de compra de cada cliente.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50 text-center p-4">
                    <Users className="h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Sin Historial de Clientes</h3>
                    <p className="text-muted-foreground">No se han generado facturas para analizar el historial de compras.</p>
                </div>
            ) : (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Cliente</TableHead>
                      <TableHead className="text-right">Gasto Total (C$)</TableHead>
                      <TableHead className="text-right"># Facturas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.clientId}>
                        <TableCell className="font-medium">{item.clientName}</TableCell>
                        <TableCell className="text-right font-bold">C$ {item.totalSpent.toFixed(2)}</TableCell>
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
