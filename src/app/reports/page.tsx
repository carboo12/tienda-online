
'use client';

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart2, Box, TrendingDown, TrendingUp, UserCheck, Wallet } from 'lucide-react';
import Link from 'next/link';

const reports = [
    {
        title: 'Informe de Inventario General',
        description: 'Un resumen completo de todos los productos y sus cantidades actuales.',
        icon: Box,
        href: '#',
    },
    {
        title: 'Informe de Stock Bajo',
        description: 'Identifica productos que están por debajo de su nivel mínimo de stock.',
        icon: TrendingDown,
        href: '#',
    },
    {
        title: 'Informe de Productos Más Vendidos',
        description: 'Descubre cuáles son tus productos estrella y optimiza tus ventas.',
        icon: TrendingUp,
        href: '#',
    },
    {
        title: 'Informe de Ventas por Vendedor',
        description: 'Analiza el rendimiento de cada vendedor o tomador de pedidos.',
        icon: UserCheck,
        href: '#',
    },
    {
        title: 'Análisis de Rentabilidad por Producto',
        description: 'Compara el costo y el precio de venta para ver la rentabilidad.',
        icon: Wallet,
        href: '#',
    },
    {
        title: 'Historial de Compras por Cliente',
        description: 'Entiende los hábitos de compra de tus clientes más leales.',
        icon: BarChart2,
        href: '#',
    }
];

export default function ReportsPage() {
    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Informes Estratégicos</h1>
                    <p className="text-muted-foreground">
                        Herramientas para analizar el rendimiento de tu negocio y tomar decisiones.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report, index) => (
                        <Link href={report.href} key={index}>
                            <Card className="hover:border-primary/80 hover:shadow-lg transition-all h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{report.title}</CardTitle>
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <report.icon className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground text-sm">
                                        {report.description}
                                    </p>
                                </CardContent>
                                <div className="p-6 pt-0 flex justify-end">
                                     <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
