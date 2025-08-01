
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function InventoryPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Inventario</h1>
            <p className="text-muted-foreground">Gestiona tus productos y niveles de stock.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Producto
        </Button>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Aquí se mostrará una lista de tus productos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No hay productos en el inventario.</p>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Aquí iría la paginación.</p>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
