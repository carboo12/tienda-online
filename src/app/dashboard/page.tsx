
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

interface Stats {
  totalRevenue: number;
  totalProducts: number;
  totalClients: number;
  activeOrders: number;
}

export default function DashboardPage() {
  const { user, app } = useAuth();
  const isAdmin = user?.name === 'admin';
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalProducts: 0, totalClients: 0, activeOrders: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!app) return;

    const fetchStats = async () => {
      setIsLoading(true);
      const db = getFirestore(app);
      try {
        // Fetch Invoices for Revenue
        const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
        const totalRevenue = invoicesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);

        // Fetch Products for Inventory Count
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const totalProducts = productsSnapshot.size;

        // Fetch Clients for Client Count
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const totalClients = clientsSnapshot.size;
        
        // Fetch Orders for Active Orders (assuming 'orders' collection exists)
        // const ordersSnapshot = await getDocs(collection(db, 'orders'));
        // const activeOrders = ordersSnapshot.size;
        const activeOrders = 0; // Placeholder until orders are implemented

        setStats({ totalRevenue, totalProducts, totalClients, activeOrders });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Keep default zero values in case of error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [app]);
  
  const statsCards = [
    { title: 'Ingresos Totales', value: `C$ ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, href: '/invoices' },
    { title: 'Artículos en Inventario', value: stats.totalProducts, icon: Package, href: '/inventory' },
    { title: 'Pedidos Activos', value: stats.activeOrders, icon: ShoppingCart, href: '/orders' },
    { title: 'Total de Clientes', value: stats.totalClients, icon: Users, href: '/clients' },
  ];
  
  const getCard = (stat: typeof statsCards[0], index: number) => {
    const isLink = isAdmin || !['/users'].includes(stat.href); // Assuming /users is admin only
    const cardContent = (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          <stat.icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stat.value}</div>}
        </CardContent>
      </Card>
    );

    if (isLink) {
      return (
        <Link key={index} href={stat.href} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
          {cardContent}
        </Link>
      )
    }
    return <div key={index}>{cardContent}</div>;
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Control</h1>
          <p className="text-muted-foreground">
            Un resumen de las operaciones de tu negocio.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map(getCard)}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Ventas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">El gráfico de ventas recientes se mostrará aquí.</p>
                    <div className="h-64 bg-muted/50 rounded-md mt-4 flex items-center justify-center">
                        [Gráfico de Ventas]
                    </div>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Pedidos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aquí aparecerá una lista de los pedidos recientes.</p>
                     <div className="h-64 bg-muted/50 rounded-md mt-4 flex items-center justify-center">
                        [Lista de Pedidos]
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
