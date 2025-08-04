
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, initializeFirestore } from 'firebase/firestore';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { getApp, getApps, initializeApp } from 'firebase/app';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


interface ProductData {
    description: string;
    productType: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    minimumStock: number;
    departmentId?: string;
}

interface Department {
    id: string;
    name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const productId = params.id as string;
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);

  useEffect(() => {
    if (!app || !productId) return;
    const db = getFirestore(app);

    const fetchProduct = async () => {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const data = productSnap.data() as ProductData;
            setDescription(data.description || '');
            setProductType(data.productType || '');
            setQuantity(data.quantity?.toString() || '0');
            setCostPrice(data.costPrice?.toString() || '0');
            setSellingPrice(data.sellingPrice?.toString() || '0');
            setMinimumStock(data.minimumStock?.toString() || '0');
            setDepartmentId(data.departmentId || 'none');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Producto no encontrado.' });
            router.push('/inventory');
        }
    };

    const fetchDepartments = async () => {
        const departmentsSnapshot = await getDocs(collection(db, 'departments'));
        const depts = departmentsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setDepartments(depts);
    };

    const loadData = async () => {
        setIsLoading(true);
        setIsLoadingDepartments(true);
        try {
            await Promise.all([fetchProduct(), fetchDepartments()]);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la información necesaria.' });
        } finally {
            setIsLoading(false);
            setIsLoadingDepartments(false);
        }
    }
    
    loadData();
  }, [app, productId, router, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !productType || !quantity || !costPrice || !sellingPrice || !minimumStock || !app) {
        toast({ variant: "destructive", title: "Campos Requeridos" });
        return;
    }

    setIsSubmitting(true);
    
    try {
      const db = getFirestore(app);
      const productRef = doc(db, 'products', productId);
      
      await updateDoc(productRef, {
        description,
        productType,
        quantity: parseInt(quantity, 10) || 0,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        minimumStock: parseInt(minimumStock, 10) || 0,
        departmentId: departmentId === 'none' ? null : departmentId,
      });

      toast({ title: "Producto Actualizado", description: "Los cambios se guardaron exitosamente." });
      router.push('/inventory');

    } catch (error) {
      console.error("Error updating document: ", error);
      toast({ variant: "destructive", title: "Error al Guardar" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
        <AppShell>
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </AppShell>
    )
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
            <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Editar Producto</CardTitle>
                <CardDescription>
                Modifica los detalles del producto y guarda los cambios.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción del Producto</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isSubmitting}/>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="productType">Tipo de Producto</Label>
                            <Input id="productType" value={productType} onChange={(e) => setProductType(e.target.value)} required disabled={isSubmitting}/>
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
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minimumStock">Stock Mínimo</Label>
                            <Input id="minimumStock" type="number" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="costPrice">Precio de Costo (C$)</Label>
                            <Input id="costPrice" type="number" step="any" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sellingPrice">Precio de Venta (C$)</Label>
                            <Input id="sellingPrice" type="number" step="any" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </form>
            </CardContent>
            </Card>
        </div>
    </AppShell>
  );
}
