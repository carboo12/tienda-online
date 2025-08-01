
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
            <h1 className="text-3xl font-bold tracking-tight font-headline">Pedidos</h1>
            <p className="text-muted-foreground">Sigue y gestiona los pedidos de los clientes.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Pedido
        </Button>
      </div>

       <Alert className="mt-4 bg-accent/30">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Modo sin conexión disponible</AlertTitle>
          <AlertDescription>
            Puedes crear nuevos pedidos incluso sin conexión a internet. Se sincronizarán automáticamente cuando vuelvas a estar en línea.
          </AlertDescription>
        </Alert>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>Aquí se mostrará una lista de los pedidos recientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No hay pedidos para mostrar.</p>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Aquí iría la paginación.</p>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
