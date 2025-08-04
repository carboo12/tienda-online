
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, ShoppingCart, Loader2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getFirestore, collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { RecentSalesChart, SalesData } from '@/components/recent-sales-chart';
import { format } from 'date-fns';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


interface Stats {
  totalRevenue: number;
  totalProducts: number;
  totalClients: number;
  activeOrders: number;
}

interface Invoice {
    total: number;
    createdAt: Timestamp;
}


export default function DashboardPage() {
  const user = getCurrentUser();
  const isAdmin = user?.name === 'admin' || user?.role === 'Superusuario';
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalProducts: 0, totalClients: 0, activeOrders: 0 });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    
    const isSuperUser = user?.name === 'admin' || user?.role === 'Superusuario';
    
    const collectionsToQuery = ['invoices', 'products', 'clients'];
    const unsubscribers = collectionsToQuery.map(col => {
        let q;
        if (isSuperUser) {
            q = query(collection(db, col));
        } else if (user?.storeId) {
            q = query(collection(db, col), where('storeId', '==', user.storeId));
        } else {
            return () => {}; // No-op if no storeId and not superuser
        }
        
        return onSnapshot(q, (snapshot) => {
            if (col === 'invoices') {
                const invoices = snapshot.docs.map(doc => doc.data() as Invoice);
                const totalRevenue = invoices.reduce((sum, doc) => sum + (doc.total || 0), 0);
                
                // Process sales data for chart
                const salesByDay: {[key: string]: number} = {};
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                invoices.forEach(invoice => {
                    const invoiceDate = invoice.createdAt.toDate();
                    if (invoiceDate >= sevenDaysAgo) {
                        const day = format(invoiceDate, 'dd/MM');
                        salesByDay[day] = (salesByDay[day] || 0) + invoice.total;
                    }
                });

                const chartData = Object.keys(salesByDay).map(day => ({
                    name: day,
                    total: salesByDay[day]
                })).sort((a,b) => a.name.localeCompare(b.name));

                setSalesData(chartData);
                setStats(prevStats => ({ ...prevStats, totalRevenue }));
            }
            if (col === 'products') {
                const totalProducts = snapshot.size;
                setStats(prevStats => ({ ...prevStats, totalProducts }));
            }
            if (col === 'clients') {
                const totalClients = snapshot.size;
                setStats(prevStats => ({ ...prevStats, totalClients }));
            }
            setIsLoading(false);
        }, (error) => {
            console.error(`Error fetching ${col}:`, error);
            setIsLoading(false);
        });
    });

    return () => unsubscribers.forEach(unsub => unsub());
    
  }, [user]);
  
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Panel de Control</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Un resumen de las operaciones de tu negocio.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map(getCard)}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
                <CardHeader>
                    <CardTitle>Ventas Recientes</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                   {isLoading ? (
                     <div className="h-80 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                     </div>
                   ) : (
                     <RecentSalesChart data={salesData} />
                   )}
                </CardContent>
            </Card>
            <Card className="col-span-full lg:col-span-3">
                <CardHeader>
                    <CardTitle>Pedidos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Aquí aparecerá una lista de los pedidos recientes.</p>
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
