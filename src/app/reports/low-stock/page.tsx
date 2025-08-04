
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFirestore, collection, onSnapshot, query, where, initializeFirestore } from 'firebase/firestore';
import { ArrowLeft, Loader2, Package, AlertTriangle } from 'lucide-react';
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


interface Product {
  id: string;
  description: string;
  quantity: number;
  minimumStock: number;
}

export default function LowStockReportPage() {
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);

  useEffect(() => {
    if (!app) return;

    setIsLoading(true);
    const db = getFirestore(app);
    // This query is inefficient on large datasets without an index.
    // Firestore will prompt to create a composite index if needed.
    const q = query(collection(db, 'products'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.quantity <= data.minimumStock) {
          productsData.push({
            id: doc.id,
            description: data.description,
            quantity: data.quantity,
            minimumStock: data.minimumStock,
          });
        }
      });
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
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
            <CardTitle className="text-2xl font-bold font-headline">Informe de Stock Bajo</CardTitle>
            <CardDescription>Productos que han alcanzado o están por debajo de su nivel mínimo de stock.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50 text-center p-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                        <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold">¡Todo en Orden!</h3>
                    <p className="text-muted-foreground">No hay productos con stock bajo en este momento.</p>
                </div>
            ) : (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción del Producto</TableHead>
                      <TableHead className="text-right">Cantidad Actual</TableHead>
                      <TableHead className="text-right">Stock Mínimo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="bg-red-50/50 dark:bg-red-900/10">
                        <TableCell className="font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          {product.description}
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600 dark:text-red-400">{product.quantity}</TableCell>
                        <TableCell className="text-right">{product.minimumStock}</TableCell>
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
