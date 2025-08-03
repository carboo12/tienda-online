
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, getDocs, doc, runTransaction, Timestamp } from 'firebase/firestore';
import { Loader2, PlusCircle, ArrowLeft, Trash2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Data interfaces
interface Client {
  id: string;
  name: string;
  creditLimit: number;
  balance: number;
}

interface Product {
  id: string;
  description: string;
  sellingPrice: number;
  quantity: number; // available stock
}

interface InvoiceItem {
  productId: string;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function NewInvoicePage() {
  const { app, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  
  // State for adding a new item
  const [currentItemId, setCurrentItemId] = useState('');
  const [currentItemQuantity, setCurrentItemQuantity] = useState(1);

  // Fetch clients and products
  useEffect(() => {
    if (!app) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const db = getFirestore(app);
        // Fetch Clients
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const clientsData = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
        setClients(clientsData);

        // Fetch Products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: 'destructive',
          title: 'Error de Carga',
          description: 'No se pudieron cargar los clientes o productos.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [app, toast]);

  const handleAddProduct = () => {
    if (!currentItemId || currentItemQuantity <= 0) {
      toast({ variant: 'destructive', title: 'Datos inválidos', description: 'Selecciona un producto y una cantidad válida.' });
      return;
    }
    const product = products.find(p => p.id === currentItemId);
    if (!product) return;

    if (product.quantity < currentItemQuantity) {
      toast({ variant: 'destructive', title: 'Stock Insuficiente', description: `Solo quedan ${product.quantity} unidades de ${product.description}.` });
      return;
    }
    
    // Check if product is already in the invoice
    const existingItemIndex = invoiceItems.findIndex(item => item.productId === product.id);
    if (existingItemIndex > -1) {
       // Update quantity if product exists
       const updatedItems = [...invoiceItems];
       const newQuantity = updatedItems[existingItemIndex].quantity + currentItemQuantity;

       if (product.quantity < newQuantity) {
          toast({ variant: 'destructive', title: 'Stock Insuficiente', description: `No puedes añadir más. Solo quedan ${product.quantity} unidades en total.` });
          return;
       }

       updatedItems[existingItemIndex].quantity = newQuantity;
       updatedItems[existingItemIndex].subtotal = newQuantity * product.sellingPrice;
       setInvoiceItems(updatedItems);
    } else {
      // Add new item if not in invoice
      const newItem: InvoiceItem = {
        productId: product.id,
        description: product.description,
        quantity: currentItemQuantity,
        price: product.sellingPrice,
        subtotal: currentItemQuantity * product.sellingPrice,
      };
      setInvoiceItems(prev => [...prev, newItem]);
    }
    
    // Reset inputs
    setCurrentItemId('');
    setCurrentItemQuantity(1);
  };
  
  const handleRemoveItem = (productId: string) => {
    setInvoiceItems(prev => prev.filter(item => item.productId !== productId));
  };
  
  const invoiceTotal = useMemo(() => {
    return invoiceItems.reduce((total, item) => total + item.subtotal, 0);
  }, [invoiceItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || invoiceItems.length === 0 || !app || !user) {
       toast({ variant: 'destructive', title: 'Factura Incompleta', description: 'Debes seleccionar un cliente y añadir al menos un producto.' });
       return;
    }

    setIsSubmitting(true);
    const db = getFirestore(app);

    try {
      await runTransaction(db, async (transaction) => {
        const clientRef = doc(db, 'clients', selectedClientId);
        const clientDoc = await transaction.get(clientRef);
        if (!clientDoc.exists()) throw new Error("El cliente no existe.");

        // Check product stock again within transaction
        for (const item of invoiceItems) {
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists() || productDoc.data().quantity < item.quantity) {
                throw new Error(`Stock insuficiente para ${item.description}.`);
            }
            // Decrease stock
            const newStock = productDoc.data().quantity - item.quantity;
            transaction.update(productRef, { quantity: newStock });
        }
        
        // Update client balance
        const newBalance = clientDoc.data().balance + invoiceTotal;
        transaction.update(clientRef, { balance: newBalance });

        // Create invoice document
        const invoiceRef = doc(collection(db, 'invoices'));
        transaction.set(invoiceRef, {
            clientId: selectedClientId,
            clientName: clientDoc.data().name,
            items: invoiceItems,
            total: invoiceTotal,
            status: 'Pendiente',
            createdAt: Timestamp.now(),
            createdBy: user.name,
            creatorRole: user.name === 'admin' ? 'Administrador' : 'Vendedor'
        });
      });

      toast({ title: 'Factura Creada', description: 'La factura ha sido guardada exitosamente.' });
      router.push('/invoices');

    } catch (error: any) {
        console.error("Error creating invoice: ", error);
        toast({ variant: 'destructive', title: 'Error en la Transacción', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <AppShell>
      <div className="flex w-full flex-col gap-6">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Facturas
            </Link>
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Crear Nueva Factura</CardTitle>
              <CardDescription>Selecciona un cliente y añade productos para generar una factura.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select onValueChange={setSelectedClientId} value={selectedClientId} required disabled={isLoading || isSubmitting}>
                        <SelectTrigger id="client">
                            <SelectValue placeholder={isLoading ? "Cargando clientes..." : "Selecciona un cliente"} />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Add Product Section */}
                <Card className="bg-muted/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Añadir Productos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1 w-full space-y-2">
                            <Label htmlFor="product">Producto</Label>
                            <Select onValueChange={setCurrentItemId} value={currentItemId} disabled={isLoading || isSubmitting}>
                                <SelectTrigger id="product">
                                    <SelectValue placeholder={isLoading ? "Cargando productos..." : "Selecciona un producto"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.description} (${p.sellingPrice.toFixed(2)}) - Stock: {p.quantity}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-auto space-y-2">
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input 
                                id="quantity" 
                                type="number" 
                                min="1" 
                                value={currentItemQuantity} 
                                onChange={(e) => setCurrentItemQuantity(parseInt(e.target.value, 10))} 
                                className="w-full sm:w-24"
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button type="button" onClick={handleAddProduct} disabled={!currentItemId || isLoading || isSubmitting}>
                            <PlusCircle className="mr-2" />
                            Añadir
                        </Button>
                    </CardContent>
                </Card>

                {/* Invoice Items Table */}
                <div className="space-y-2">
                    <Label>Items de la Factura</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unit.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                Aún no hay productos en la factura.
                              </TableCell>
                            </TableRow>
                          ) : (
                            invoiceItems.map(item => (
                              <TableRow key={item.productId}>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)} disabled={isSubmitting}>
                                    <Trash2 className="text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex flex-col items-end space-y-4 bg-muted/50 p-6">
                <div className="flex justify-between w-full max-w-xs text-lg font-bold">
                    <span>Total:</span>
                    <span>${invoiceTotal.toFixed(2)}</span>
                </div>
                 <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isLoading || invoiceItems.length === 0}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                    {isSubmitting ? 'Guardando Factura...' : 'Crear Factura'}
                  </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppShell>
  );
}
