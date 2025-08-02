
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { Loader2, PlusCircle, History, Building2, FilePenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface Product {
  id: string;
  description: string;
  productType: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  minimumStock: number;
  departmentId?: string;
  departmentName?: string;
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
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const productsData: Product[] = [];
        for (const productDoc of querySnapshot.docs) {
          const data = productDoc.data();
          let departmentName = 'Sin Departamento';

          if (data.departmentId) {
             try {
                const deptDocRef = doc(db, 'departments', data.departmentId);
                const deptDoc = await getDoc(deptDocRef);
                if (deptDoc.exists()) {
                    departmentName = deptDoc.data().name;
                }
             } catch (error) {
                console.error("Error fetching department name:", error);
                departmentName = 'Error';
             }
          }

          productsData.push({
            id: productDoc.id,
            description: data.description,
            productType: data.productType,
            quantity: data.quantity,
            costPrice: data.costPrice,
            sellingPrice: data.sellingPrice,
            minimumStock: data.minimumStock,
            departmentId: data.departmentId,
            departmentName: departmentName
          });
        }
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
             <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline">
                    <Link href="/inventory/kardex">
                        <History className="mr-2 h-4 w-4" />
                        Kardex
                    </Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/inventory/departments">
                        <Building2 className="mr-2 h-4 w-4" />
                        Departamentos
                    </Link>
                </Button>
                <Button asChild>
                <Link href="/inventory/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                </Link>
                </Button>
            </div>
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
              <TooltipProvider>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="hidden sm:table-cell">Departamento</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Stock Mínimo</TableHead>
                        <TableHead className="text-right">Venta (C$)</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.description}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{product.departmentName}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             {product.quantity <= product.minimumStock && (
                                <Tooltip>
                                  <TooltipTrigger>
                                     <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Stock bajo</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            {product.quantity}
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">{product.minimumStock}</TableCell>
                        <TableCell className="text-right">{product.sellingPrice.toFixed(2)}</TableCell>
                         <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/inventory/edit/${product.id}`}>
                                    <FilePenLine className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
