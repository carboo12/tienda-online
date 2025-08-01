
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, WifiOff } from 'lucide-react';

export default function OrdersPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Orders</h1>
            <p className="text-muted-foreground">Track and manage customer orders.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

       <Alert className="mt-4 bg-accent/30">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Offline Mode Available</AlertTitle>
          <AlertDescription>
            You can create new orders even without an internet connection. They will sync automatically when you're back online.
          </AlertDescription>
        </Alert>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>A list of recent orders will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No orders to display.</p>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">This is where pagination would go.</p>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
