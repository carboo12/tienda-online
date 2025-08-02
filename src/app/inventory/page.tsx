
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


interface Product {
  id: string;
  description: string;
  productType: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
}

export default function InventoryPage() {
  const { app, isAuthLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

   useEffect(() => {
    if (isAuthLoading || !app) {
      return;
    }
    
    setIsDataLoading(true);
    const db = getFirestore(app);
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            description: data.description,
            productType: data.productType,
            quantity: data.quantity,
            costPrice: data.costPrice,
            sellingPrice: data.sellingPrice,
          });
        });
        setProducts(productsData);
        setIsDataLoading(false);
      }, 
      (error) => {
        console.error("Error fetching products: ", error);
        setIsDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [app, isAuthLoading]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">Inventario</h1>
              <p className="text-muted-foreground">Gestiona tus productos y niveles de stock.</p>
            </div>
            <Button asChild>
              <Link href="/inventory/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
              </Link>
            </Button>
        </div>
      
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>Aquí se mostrará una lista de tus productos.</CardDescription>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
               <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">No hay productos en el inventario.</p>
                </div>
            ) : (
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Costo (C$)</TableHead>
                      <TableHead className="text-right">Venta (C$)</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {products.map((product) => (
                      <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.description}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{product.productType}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">{product.costPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.sellingPrice.toFixed(2)}</TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
