
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';

interface Department {
    id: string;
    name: string;
}

export default function NewProductPage() {
  const { app } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);

  // Form state
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [departmentId, setDepartmentId] = useState('none');

  useEffect(() => {
    if (!app) return;
    const fetchDepartments = async () => {
        setIsLoadingDepartments(true);
        try {
            const db = getFirestore(app);
            const departmentsSnapshot = await getDocs(collection(db, 'departments'));
            const depts = departmentsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setDepartments(depts);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los departamentos.' });
        } finally {
            setIsLoadingDepartments(false);
        }
    };
    fetchDepartments();
  }, [app, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !productType || !quantity || !costPrice || !sellingPrice || !minimumStock) {
        toast({
            variant: "destructive",
            title: "Campos Requeridos",
            description: "Por favor, completa todos los campos del formulario.",
        });
        return;
    }
    if (!app) return;

    setIsSubmitting(true);
    
    try {
      const db = getFirestore(app);
      
      await addDoc(collection(db, "products"), {
        description,
        productType,
        quantity: parseInt(quantity, 10) || 0,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        minimumStock: parseInt(minimumStock, 10) || 0,
        departmentId: departmentId === 'none' ? null : departmentId,
        createdAt: new Date(),
      });

      toast({
        title: "Producto Añadido",
        description: `El producto "${description}" ha sido registrado exitosamente.`,
      });

      router.push('/inventory');

    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo añadir el producto. Por favor, inténtalo de nuevo.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

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
            <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Añadir Nuevo Producto</CardTitle>
                <CardDescription>
                Completa el formulario para registrar un nuevo producto en el inventario.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción del Producto</Label>
                        <Input id="description" placeholder="Ej: Gaseosa 3L" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isSubmitting}/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="productType">Tipo de Producto</Label>
                            <Input id="productType" placeholder="Ej: Bebida" value={productType} onChange={(e) => setProductType(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="department">Departamento (Opcional)</Label>
                            <Select onValueChange={setDepartmentId} value={departmentId} disabled={isLoadingDepartments || isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingDepartments ? "Cargando..." : "Selecciona un departamento"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin Departamento</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                            <Label htmlFor="quantity">Cantidad Inicial</Label>
                            <Input id="quantity" type="number" placeholder="Ej: 100" value={quantity} onChange={(e) => setQuantity(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minimumStock">Stock Mínimo</Label>
                            <Input id="minimumStock" type="number" placeholder="Ej: 10" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="costPrice">Precio de Costo (C$)</Label>
                            <Input id="costPrice" type="number" step="any" placeholder="Ej: 25.50" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sellingPrice">Precio de Venta (C$)</Label>
                            <Input id="sellingPrice" type="number" step="any" placeholder="Ej: 35.00" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {isSubmitting ? 'Añadiendo...' : 'Agregar Producto'}
                    </Button>
                </form>
            </CardContent>
            </Card>
        </div>
    </AppShell>
  );
}
