
'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.name === 'admin';

  const stats = [
    { title: 'Ingresos Totales', value: '$45,231.89', change: '+20.1% desde el mes pasado', icon: DollarSign, href: '/invoices' },
    { title: 'Inventario', value: '12,832 artículos', change: '+2.1% desde el mes pasado', icon: Package, href: '/inventory' },
    { title: 'Pedidos Activos', value: '573', change: '+19 desde la última hora', icon: ShoppingCart, href: '/orders' },
    { title: 'Nuevos Clientes', value: '+2350', change: '+180.1% desde el mes pasado', icon: Users, href: '/users' },
  ];
  
  const getCard = (stat: typeof stats[0], index: number) => {
    const isLink = isAdmin || !['/users'].includes(stat.href);
    const cardContent = (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          <stat.icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stat.value}</div>
          <p className="text-xs text-muted-foreground">{stat.change}</p>
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
    // The key is passed to cardContent which is a Card component in this case
    return React.cloneElement(cardContent, { key: index });
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
          {stats.map(getCard)}
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
