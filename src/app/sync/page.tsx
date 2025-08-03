
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { getPendingOperations, processSyncQueue, clearAllPendingOperations } from '@/lib/offline-sync';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface PendingOperation {
    id?: number;
    type: string;
    payload: any;
    timestamp: string;
}

export default function SyncPage() {
    const [pendingOps, setPendingOps] = useState<PendingOperation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const isOnline = useOnlineStatus();
    const { toast } = useToast();

    const fetchPendingOps = useCallback(async () => {
        setIsLoading(true);
        try {
            const ops = await getPendingOperations();
            setPendingOps(ops);
        } catch (error) {
            console.error("Error fetching pending operations:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las operaciones pendientes.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPendingOps();
    }, [fetchPendingOps]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { successCount, failureCount } = await processSyncQueue();
            if (failureCount > 0) {
                 toast({ variant: 'destructive', title: 'Sincronización Incompleta', description: `${failureCount} operaciones fallaron. Por favor, inténtalo de nuevo.` });
            } else {
                 toast({ title: 'Sincronización Exitosa', description: `${successCount} operaciones han sido sincronizadas.` });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error de Sincronización', description: error.message });
        } finally {
            setIsSyncing(false);
            fetchPendingOps(); // Refresh the list
        }
    };
    
    const handleClearAll = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar todas las operaciones pendientes? Esta acción no se puede deshacer.')) {
            try {
                await clearAllPendingOperations();
                toast({ title: 'Cola Limpiada', description: 'Todas las operaciones pendientes han sido eliminadas.' });
                fetchPendingOps();
            } catch (error) {
                console.error("Error clearing pending operations:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo limpiar la cola de operaciones.' });
            }
        }
    }


    const getOperationDescription = (op: PendingOperation) => {
        switch (op.type) {
            case 'ADD_CLIENT':
                return `Añadir cliente: ${op.payload.name}`;
            case 'ADD_STORE':
                return `Añadir tienda: ${op.payload.name}`;
            default:
                return `Operación desconocida`;
        }
    }

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">Sincronización de Datos</h1>
                        <p className="text-muted-foreground">Gestiona los datos guardados localmente mientras estabas sin conexión.</p>
                    </div>
                     <div className="flex gap-2">
                        <Button onClick={handleClearAll} variant="destructive" disabled={isLoading || isSyncing || pendingOps.length === 0}>
                            <Trash2 className="mr-2"/>
                            Limpiar Cola
                        </Button>
                        <Button onClick={handleSync} disabled={!isOnline || isLoading || isSyncing || pendingOps.length === 0}>
                            {isSyncing ? <Loader2 className="mr-2 animate-spin" /> : <RefreshCw className="mr-2" />}
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                        </Button>
                     </div>
                 </div>

                {!isOnline && (
                    <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            <div>
                                <h3 className="font-semibold">Estás sin conexión</h3>
                                <p className="text-sm text-muted-foreground">Conéctate a internet para poder sincronizar tus datos.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                 
                 <Card>
                    <CardHeader>
                        <CardTitle>Operaciones Pendientes</CardTitle>
                        <CardDescription>Esta es la lista de datos que se guardaron localmente y necesitan ser subidos a la nube.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : pendingOps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50 text-center p-4">
                                <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
                                <h3 className="text-lg font-semibold">¡Todo Sincronizado!</h3>
                                <p className="text-muted-foreground">No hay operaciones pendientes en la cola.</p>
                            </div>
                        ) : (
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Fecha de Creación</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {pendingOps.map((op) => (
                                    <TableRow key={op.id}>
                                        <TableCell className="font-medium">{getOperationDescription(op)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{format(new Date(op.timestamp), "dd/MM/yyyy 'a las' HH:mm")}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                 </Card>
            </div>
        </AppShell>
    );
}
