
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
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


interface SoldProduct {
  productId: string;
  description: string;
  totalQuantity: number;
}

export default function BestSellingProductsReportPage() {
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);
  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);


  useEffect(() => {
    if (!app || !user) return;

    const fetchBestSellers = async () => {
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
      
      const productQuantities: { [key: string]: { description: string, totalQuantity: number } } = {};

      invoicesSnapshot.forEach((doc) => {
        const invoice = doc.data();
        if (invoice.items && Array.isArray(invoice.items)) {
          invoice.items.forEach((item: any) => {
            if (item.productId && item.quantity) {
              if (productQuantities[item.productId]) {
                productQuantities[item.productId].totalQuantity += item.quantity;
              } else {
                productQuantities[item.productId] = {
                  description: item.description,
                  totalQuantity: item.quantity,
                };
              }
            }
          });
        }
      });
      
      const aggregatedProducts = Object.keys(productQuantities).map(productId => ({
        productId,
        description: productQuantities[productId].description,
        totalQuantity: productQuantities[productId].totalQuantity,
      }));

      // Sort by quantity descending
      aggregatedProducts.sort((a, b) => b.totalQuantity - a.totalQuantity);
      
      setSoldProducts(aggregatedProducts);
      setIsLoading(false);
    };

    fetchBestSellers();
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
            <CardTitle className="text-2xl font-bold font-headline">Informe de Productos Más Vendidos</CardTitle>
            <CardDescription>Ranking de productos basado en la cantidad total de unidades vendidas.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : soldProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50 text-center p-4">
                    <Trophy className="h-8 w-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Sin Datos de Ventas</h3>
                    <p className="text-muted-foreground">Aún no se han registrado facturas para analizar los productos más vendidos.</p>
                </div>
            ) : (
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Descripción del Producto</TableHead>
                      <TableHead className="text-right">Unidades Vendidas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soldProducts.map((product, index) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-bold text-lg text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{product.description}</TableCell>
                        <TableCell className="text-right font-bold">{product.totalQuantity}</TableCell>
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
