
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function InventoryPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Inventory</h1>
            <p className="text-muted-foreground">Manage your products and stock levels.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>A list of your products will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No products in inventory.</p>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">This is where pagination would go.</p>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
