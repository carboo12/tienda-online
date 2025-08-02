
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, FormEvent, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


interface Department {
    id: string;
    name: string;
}

export default function DepartmentsPage() {
    const { app } = useAuth();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentName, setDepartmentName] = useState('');

    useEffect(() => {
        if (!app) return;
        setIsLoading(true);
        const db = getFirestore(app);
        const q = query(collection(db, 'departments'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const depts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
            setDepartments(depts);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching departments: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los departamentos.' });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [app, toast]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!departmentName.trim()) {
            toast({ variant: 'destructive', title: 'Campo Requerido', description: 'El nombre del departamento no puede estar vacío.' });
            return;
        }
        if (!app) return;

        setIsSubmitting(true);
        try {
            const db = getFirestore(app);
            await addDoc(collection(db, 'departments'), {
                name: departmentName
            });
            toast({ title: 'Departamento Añadido', description: `El departamento "${departmentName}" se ha creado.` });
            setDepartmentName('');
        } catch (error) {
            console.error("Error adding department: ", error);
            toast({ variant: 'destructive', title: 'Error al Guardar' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AppShell>
            <div className="flex w-full flex-col gap-6">
                <div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/inventory">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Inventario
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Añadir Departamento</CardTitle>
                                <CardDescription>Crea un nuevo departamento para organizar tus productos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="departmentName">Nombre del Departamento</Label>
                                        <Input
                                            id="departmentName"
                                            placeholder="Ej: Ropa, Electrónicos"
                                            value={departmentName}
                                            onChange={(e) => setDepartmentName(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                        Añadir Departamento
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                         <Card>
                            <CardHeader>
                                <CardTitle>Departamentos Existentes</CardTitle>
                                <CardDescription>Lista de todos los departamentos registrados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-48">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {departments.map(dept => (
                                                <TableRow key={dept.id}>
                                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

