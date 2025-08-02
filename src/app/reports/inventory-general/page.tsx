
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, FileDown, Printer, Loader2, Package, Warehouse, CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Product {
  id: string;
  description: string;
  productType: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  minimumStock: number;
  departmentName?: string;
  totalValue: number;
}

export default function GeneralInventoryReportPage() {
  const { app, isAuthLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !app) return;

    setIsLoading(true);
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
            console.error("Error fetching department:", error);
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
          departmentName: departmentName,
          totalValue: (data.quantity || 0) * (data.costPrice || 0)
        });
      }
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [app, isAuthLoading]);

  const reportMetrics = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + p.totalValue, 0);
    return { totalProducts, totalStock, totalValue };
  }, [products]);

  const handleExport = () => {
    const dataToExport = products.map(p => ({
        'Descripción': p.description,
        'Departamento': p.departmentName,
        'Tipo': p.productType,
        'Cantidad': p.quantity,
        'Stock Mínimo': p.minimumStock,
        'Precio Costo (C$)': p.costPrice,
        'Precio Venta (C$)': p.sellingPrice,
        'Valor Total (C$)': p.totalValue,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // Set column widths
    worksheet['!cols'] = [
        { wch: 30 }, // Descripción
        { wch: 20 }, // Departamento
        { wch: 15 }, // Tipo
        { wch: 10 }, // Cantidad
        { wch: 15 }, // Stock Mínimo
        { wch: 15 }, // Precio Costo
        { wch: 15 }, // Precio Venta
        { wch: 15 }, // Valor Total
    ];

    const fileName = `informe_inventario_general_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handlePrint = () => {
    window.print();
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
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <CardTitle className="text-2xl font-bold font-headline">Informe de Inventario General</CardTitle>
                <CardDescription>Un resumen completo de todos los productos, sus cantidades y su valor.</CardDescription>
              </div>
              <p className="text-sm text-muted-foreground whitespace-nowrap">{format(new Date(), "dd/MM/yyyy")}</p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportMetrics.totalProducts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unidades Totales en Stock</CardTitle>
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportMetrics.totalStock}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valor Total del Inventario (C$)</CardTitle>
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportMetrics.totalValue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción del Producto</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Precio Costo</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Precio Venta</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.description}</TableCell>
                          <TableCell className="text-muted-foreground">{product.departmentName}</TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right hidden sm:table-cell">C$ {product.costPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right hidden sm:table-cell">C$ {product.sellingPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold">C$ {product.totalValue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
           <CardFooter className="flex justify-end gap-2 mt-4 no-print">
                <Button variant="outline" onClick={handleExport} disabled={isLoading}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar a Excel
                </Button>
                <Button variant="outline" onClick={handlePrint} disabled={isLoading}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </CardFooter>
        </Card>
      </div>

       <style jsx global>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #report-card, #report-card * {
                    visibility: visible;
                }
                #report-card {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    border: none;
                    box-shadow: none;
                }
                .no-print {
                    display: none;
                }
            }
        `}</style>
    </AppShell>
  );
}
