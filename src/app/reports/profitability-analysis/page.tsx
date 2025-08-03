
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { ArrowLeft, Loader2, Wallet, Percent } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProductProfit {
  id: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  profitPercentage: number;
}

export default function ProfitabilityAnalysisPage() {
  const { app, isAuthLoading } = useAuth();
  const [products, setProducts] = useState<ProductProfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !app) return;

    setIsLoading(true);
    const db = getFirestore(app);
    const q = query(collection(db, 'products'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: ProductProfit[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const cost = data.costPrice || 0;
        const selling = data.sellingPrice || 0;
        const profitMargin = selling - cost;
        const profitPercentage = cost > 0 ? (profitMargin / cost) * 100 : 0;
        
        productsData.push({
          id: doc.id,
          description: data.description,
          costPrice: cost,
          sellingPrice: selling,
          profitMargin,
          profitPercentage,
        });
      });
      // Sort by profit percentage descending
      productsData.sort((a, b) => b.profitPercentage - a.profitPercentage);
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [app, isAuthLoading]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 50) return 'text-green-600 dark:text-green-400';
    if (percentage >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
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
            <CardTitle className="text-2xl font-bold font-headline">Análisis de Rentabilidad por Producto</CardTitle>
            <CardDescription>Compara costos y precios de venta para identificar los productos más rentables.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50 text-center p-4">
                    <Wallet className="h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Hay Productos</h3>
                    <p className="text-muted-foreground">Aún no se han registrado productos para analizar su rentabilidad.</p>
                </div>
            ) : (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio Costo (C$)</TableHead>
                      <TableHead className="text-right">Precio Venta (C$)</TableHead>
                      <TableHead className="text-right">Margen (C$)</TableHead>
                      <TableHead className="text-right">Margen (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.description}</TableCell>
                        <TableCell className="text-right">{product.costPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.sellingPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">{product.profitMargin.toFixed(2)}</TableCell>
                        <TableCell className={cn("text-right font-bold flex items-center justify-end gap-1", getPercentageColor(product.profitPercentage))}>
                           {product.profitPercentage.toFixed(2)} <Percent className="h-3 w-3"/>
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
    </AppShell>
  );
}
