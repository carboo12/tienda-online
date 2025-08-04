
'use client';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { getFirestore, collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { format } from 'date-fns';

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

interface ActionLog {
    id: string;
    user: string;
    action: string;
    details: string;
    timestamp: Date;
    status: 'success' | 'failure' | 'info';
    storeId?: string;
}

export default function LogPage() {
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [logs, setLogs] = useState<ActionLog[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const isAllowed = currentUser?.name === 'admin' || currentUser?.role === 'Superusuario' || currentUser?.role === 'Administrador de Tienda';
    if (!isAllowed) {
      router.replace('/dashboard');
    } else {
        setIsLoading(false);
    }
  }, [router]);
  
  useEffect(() => {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const db = getFirestore(app);

      let q;
      const isSuperUser = currentUser.name === 'admin' || currentUser.role === 'Superusuario';

      if (isSuperUser) {
          q = query(collection(db, 'action_logs'), orderBy('timestamp', 'desc'));
      } else if (currentUser.role === 'Administrador de Tienda' && currentUser.storeId) {
          q = query(collection(db, 'action_logs'), where('storeId', '==', currentUser.storeId), orderBy('timestamp', 'desc'));
      } else {
          setIsLoading(false);
          return;
      }
      
      setIsLoading(true);
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const logsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: (doc.data().timestamp as Timestamp).toDate()
          } as ActionLog));
          setLogs(logsData);
          setIsLoading(false);
      }, (error) => {
          console.error("Error fetching action logs:", error);
          setIsLoading(false);
      });

      return () => unsubscribe();
      
  }, [user]);

  if (isLoading || !user || !(user.name === 'admin' || user.role === 'Superusuario' || user.role === 'Administrador de Tienda')) {
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
            Un registro de todas las acciones de los usuarios en el sistema.
          </p>
        </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actividad del Sistema</CardTitle>
          <CardDescription>Todas las acciones se registran aquí para fines de auditoría.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                 <div className="flex h-64 items-center justify-center border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No hay registros de acciones para mostrar.</p>
                </div>
            ) : (
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
                    {logs.map((log) => (
                        <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell>
                             <Badge variant={log.action.includes('CREATE') ? 'default' : log.action.includes('UPDATE') ? 'info' : 'secondary'}>
                                {log.action}
                             </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.details}</TableCell>
                        <TableCell>
                            <Badge variant={
                            log.status === 'failure' ? 'destructive' : 'default'
                            }>
                            {log.status === 'success' ? 'Éxito' : 'Info'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs">{format(log.timestamp, 'dd/MM/yy HH:mm:ss')}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
