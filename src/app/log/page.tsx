
'use client';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

const logData = [
    { id: 1, user: 'user1@example.com', action: 'CREATE_INVOICE', details: 'Factura #INV-0012 creada para Cliente A', timestamp: '2023-10-27 10:00:00', status: 'Éxito' },
    { id: 2, user: 'user2@example.com', action: 'UPDATE_PRODUCT', details: 'Producto SKU #PROD-554 cantidad actualizada a 50', timestamp: '2023-10-27 10:05:12', status: 'Éxito' },
    { id: 3, user: 'admin', action: 'DELETE_USER', details: 'Cuenta de usuario para user3@example.com eliminada', timestamp: '2023-10-27 10:15:34', status: 'Advertencia' },
    { id: 4, user: 'user1@example.com', action: 'CREATE_ORDER', details: 'Pedido #ORD-987 creado', timestamp: '2023-10-27 11:20:05', status: 'Éxito' },
    { id: 5, user: 'user2@example.com', action: 'LOGIN_ATTEMPT', details: 'Intento de inicio de sesión fallido desde IP 192.168.1.10', timestamp: '2023-10-27 11:30:15', status: 'Error' },
    { id: 6, user: 'admin', action: 'VIEW_REPORT', details: 'Visto informe de ventas de IA para Q3', timestamp: '2023-10-27 12:00:00', status: 'Info' },
];

export default function LogPage() {
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser?.name !== 'admin') {
      router.replace('/dashboard');
    } else {
        setIsLoading(false);
    }
  }, [router]);

  if (isLoading || !user || user.name !== 'admin') {
    return <AppShell>
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    </AppShell>;
  }

  return (
    <AppShell>
       <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Registro de Acciones</h1>
          <p className="text-muted-foreground">
            Un registro de todas las acciones de los usuarios en el sistema. Solo para ojos de administrador.
          </p>
        </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actividad de Usuario</CardTitle>
          <CardDescription>Todas las acciones de los usuarios se registran aquí para fines de auditoría.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Marca de Tiempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                  <TableCell>
                    <Badge variant={
                      log.status === 'Error' ? 'destructive' :
                      log.status === 'Advertencia' ? 'secondary' : 'default'
                    }>
                      {log.status === 'Success' ? 'Éxito' : log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
