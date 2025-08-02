
'use client';

import React from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileDown, Printer } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';

// Mock data based on the provided image
const kardexData = [
  { time: '05:29 pm', product: 'PIERNA DE CERDO MEGA', movement: 'Venta #7248', before: '119...', type: 'SALIDA', quantity: '41.666', after: '11916...', cashier: 'Ana Belen Or...', department: 'Sin Departamento' },
  { time: '05:24 pm', product: 'PIERNA DE CERDO MEGA', movement: 'Devolución de venta #7243', before: '594...', type: 'DEVOLUCION', quantity: '-60...', after: '11958..', cashier: 'Ana Belen Or...', department: 'Sin Departamento' },
  { time: '04:51 pm', product: 'PECHUGA DE POLLO ARIZTIA', movement: 'Venta #7247', before: '215...', type: 'SALIDA', quantity: '0.650', after: '214.415', cashier: 'Ana Belen Or...', department: 'Sin Departamento' },
  { time: '04:30 pm', product: 'Bistec De Cerdo Rebanado CSA', movement: 'Venta #7246', before: '621...', type: 'SALIDA', quantity: '0.380', after: '621.032', cashier: 'Ana Belen Or...', department: 'Sin Departamento' },
  { time: '03:25 pm', product: 'PIERNA DE CERDO MEGA', movement: 'Recepción de inventario #2170', before: '594...', type: 'ENTRADA', quantity: '601...', after: '11958...', cashier: 'Ana Belen Or...', department: 'Sin Departamento' },
  { time: '10:29 am', product: 'T BONE DE RES CSA PZA BASICA', movement: 'Ajuste de inventario #2251', before: '25.040', type: 'AJUSTE', quantity: '-12...', after: '12.783', cashier: 'Ana Belen Or...', department: 'Sin Departamento' },
  { time: '10:28 am', product: 'PIERNA DE CERDO MEGA', movement: 'Ajuste de inventario #2250', before: '595...', type: 'AJUSTE', quantity: '-11..', after: '5942.202', cashier: 'Ana Belen Or...', department: 'Sin Departamento' },
];

const getBadgeVariant = (type: string): BadgeProps['variant'] => {
    switch (type) {
        case 'ENTRADA':
            return 'default'; // Green
        case 'SALIDA':
            return 'destructive'; // Red
        case 'DEVOLUCION':
            return 'special'; // Purple
        case 'AJUSTE':
            return 'info'; // Blue
        default:
            return 'secondary';
    }
}

export default function KardexPage() {

  const handleExport = () => {
    const csv = Papa.unparse(kardexData, {
        header: true,
        quotes: true,
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'kardex_movimientos.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  const handlePrint = () => {
      window.print();
  }

  return (
    <AppShell>
      <div className="flex w-full flex-col gap-6" id="kardex-page">
         <div className="no-print">
            <Button variant="outline" size="sm" asChild>
                <Link href="/inventory">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inventario
                </Link>
            </Button>
        </div>
        <Card id="kardex-card">
          <CardHeader>
            <CardTitle>Historial de Movimientos de Inventario</CardTitle>
            <CardDescription>
              Un registro detallado de todas las entradas, salidas y ajustes de stock.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-4 no-print">
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-sm font-medium">Buscar por:</label>
                    <Input placeholder="Cajero, Producto o Departamento" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-sm font-medium">Movimientos</label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="salida">Salida</SelectItem>
                            <SelectItem value="ajuste">Ajuste</SelectItem>
                            <SelectItem value="devolucion">Devolución</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="border rounded-lg overflow-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Descripción del Producto</TableHead>
                        <TableHead>Movimiento</TableHead>
                        <TableHead className="text-right">Había</TableHead>
                        <TableHead className="text-center">Tipo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Hay</TableHead>
                        <TableHead>Cajero</TableHead>
                        <TableHead>Departamento</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {kardexData.map((item, index) => (
                        <TableRow key={index}>
                        <TableCell className="text-muted-foreground whitespace-nowrap">{item.time}</TableCell>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell className="text-muted-foreground">{item.movement}</TableCell>
                        <TableCell className="text-right">{item.before}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={getBadgeVariant(item.type)} className="capitalize">
                               {item.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-bold">{item.after}</TableCell>
                        <TableCell className="text-muted-foreground">{item.cashier}</TableCell>
                        <TableCell className="text-muted-foreground">{item.department}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
             <div className="flex justify-end gap-2 mt-4 no-print">
                <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar movimientos
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

       <style jsx global>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #kardex-card, #kardex-card * {
                    visibility: visible;
                }
                #kardex-card {
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
