
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', icon: DollarSign },
    { title: 'Inventory', value: '12,832 items', change: '+2.1% from last month', icon: Package },
    { title: 'Active Orders', value: '573', change: '+19 from last hour', icon: ShoppingCart },
    { title: 'New Customers', value: '+2350', change: '+180.1% from last month', icon: Users },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of your business operations.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Chart of recent sales will be displayed here.</p>
                    <div className="h-64 bg-muted/50 rounded-md mt-4 flex items-center justify-center">
                        [Sales Chart]
                    </div>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A list of recent orders will appear here.</p>
                     <div className="h-64 bg-muted/50 rounded-md mt-4 flex items-center justify-center">
                        [Order List]
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
