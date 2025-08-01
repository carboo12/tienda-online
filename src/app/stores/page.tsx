
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { addDoc, collection, getFirestore, onSnapshot, query, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { CalendarIcon, Loader2, PlusCircle, FilePenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';

interface Store {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email?: string;
  licenseExpires: Date;
}

// Re-initialize app and Firestore here to ensure context is correct
// This is safe because getApps()/getApp() prevents re-initialization
const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default function StoresPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [stores, setStores] = useState<Store[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // State for adding a new store
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseExpires, setLicenseExpires] = useState<Date>();

  // State for editing an existing store
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }
    if (user?.name !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    
    setIsDataLoading(true);
    const q = query(collection(db, 'stores'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const storesData: Store[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          storesData.push({
            id: doc.id,
            name: data.name,
            owner: data.owner,
            phone: data.phone,
            email: data.email,
            licenseExpires: (data.licenseExpires as Timestamp).toDate(),
          });
        });
        setStores(storesData);
        setIsDataLoading(false);
      }, 
      (error) => {
        console.error("Error fetching stores: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar las tiendas.',
        });
        setIsDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthLoading, router, toast]);

  const handleAddStore = async (e: FormEvent) => {
    e.preventDefault();
    if (!licenseExpires) {
        toast({
            variant: "destructive",
            title: "Campo Requerido",
            description: "Por favor, selecciona la fecha de vencimiento de la licencia.",
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "stores"), {
        name: storeName,
        owner: ownerName,
        phone,
        email,
        licenseExpires: Timestamp.fromDate(licenseExpires),
      });

      toast({
        title: "Tienda Añadida",
        description: `La tienda "${storeName}" ha sido registrada exitosamente.`,
      });

      setStoreName('');
      setOwnerName('');
      setPhone('');
      setEmail('');
      setLicenseExpires(undefined);

    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo añadir la tienda. Por favor, inténtalo de nuevo.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore({...store});
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateStore = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingStore || !editingStore.licenseExpires) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No hay datos de tienda para actualizar o falta la fecha.",
        });
        return;
    }
    setIsEditSubmitting(true);
    try {
        const storeRef = doc(db, 'stores', editingStore.id);
        await updateDoc(storeRef, {
            name: editingStore.name,
            owner: editingStore.owner,
            phone: editingStore.phone,
            email: editingStore.email,
            licenseExpires: Timestamp.fromDate(editingStore.licenseExpires),
        });
        toast({
            title: "Tienda Actualizada",
            description: "Los cambios se han guardado correctamente.",
        });
        setIsEditDialogOpen(false);
        setEditingStore(null);
    } catch (error) {
        console.error("Error updating document: ", error);
        toast({
            variant: "destructive",
            title: "Error al Actualizar",
            description: "No se pudo guardar los cambios. Inténtalo de nuevo.",
        });
    } finally {
        setIsEditSubmitting(false);
    }
  }

  if (isAuthLoading || user?.name !== 'admin') {
    return (
      <AppShell>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Tiendas</h1>
          <p className="text-muted-foreground">
            Añade, edita y gestiona las tiendas de tus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Añadir Nueva Tienda</CardTitle>
                <CardDescription>
                  Completa el formulario para registrar una nueva tienda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddStore} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nombre de la Tienda</Label>
                    <Input id="storeName" placeholder="Ej: Moda Exclusiva" value={storeName} onChange={(e) => setStoreName(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nombre del Dueño/a</Label>
                    <Input id="ownerName" placeholder="Ej: Carolina Herrera" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" placeholder="Ej: 555-123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
                    <Input id="email" type="email" placeholder="Ej: contacto@moda.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="license">Vencimiento de Licencia</Label>
                       <Popover>
                          <PopoverTrigger asChild>
                          <Button
                              variant={"outline"}
                              className={cn(
                              "w-full justify-start text-left font-normal",
                              !licenseExpires && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                          >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {licenseExpires ? format(licenseExpires, "PPP", ) : <span>Selecciona una fecha</span>}
                          </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                          <Calendar
                              mode="single"
                              selected={licenseExpires}
                              onSelect={setLicenseExpires}
                              initialFocus
                          />
                          </PopoverContent>
                      </Popover>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Añadiendo...' : 'Añadir Tienda'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tiendas Registradas</CardTitle>
                 <CardDescription>
                  Esta es la lista de todas las tiendas activas en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {isDataLoading ? (
                   <div className="flex justify-center items-center h-48">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                   </div>
                 ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre Tienda</TableHead>
                        <TableHead>Dueño/a</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stores.length > 0 ? (
                        stores.map((store) => (
                          <TableRow key={store.id}>
                            <TableCell className="font-medium">{store.name}</TableCell>
                            <TableCell>{store.owner}</TableCell>
                            <TableCell className="text-muted-foreground">{store.phone}</TableCell>
                            <TableCell>{format(store.licenseExpires, "dd/MM/yyyy")}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEditStore(store)}>
                                    <FilePenLine className="h-4 w-4" />
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No hay tiendas registradas.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

       {editingStore && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editar Tienda</DialogTitle>
                    <DialogDescription>
                        Realiza cambios en los datos de la tienda aquí. Haz clic en guardar cuando hayas terminado.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                  <form id="edit-store-form" onSubmit={handleUpdateStore} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStoreName">Nombre de la Tienda</Label>
                      <Input id="editStoreName" value={editingStore.name} onChange={(e) => setEditingStore({...editingStore, name: e.target.value})} required disabled={isEditSubmitting}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editOwnerName">Nombre del Dueño/a</Label>
                      <Input id="editOwnerName" value={editingStore.owner} onChange={(e) => setEditingStore({...editingStore, owner: e.target.value})} required disabled={isEditSubmitting}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPhone">Teléfono</Label>
                      <Input id="editPhone" type="tel" value={editingStore.phone} onChange={(e) => setEditingStore({...editingStore, phone: e.target.value})} required disabled={isEditSubmitting}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEmail">Correo Electrónico (Opcional)</Label>
                      <Input id="editEmail" type="email" value={editingStore.email || ''} onChange={(e) => setEditingStore({...editingStore, email: e.target.value})} disabled={isEditSubmitting}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="editLicense">Vencimiento de Licencia</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !editingStore.licenseExpires && "text-muted-foreground")}
                                disabled={isEditSubmitting}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editingStore.licenseExpires ? format(editingStore.licenseExpires, "PPP") : <span>Selecciona una fecha</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={editingStore.licenseExpires}
                                onSelect={(date) => setEditingStore({...editingStore, licenseExpires: date as Date})}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                  </form>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="secondary" disabled={isEditSubmitting}>Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" form="edit-store-form" disabled={isEditSubmitting}>
                      {isEditSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Cambios
                  </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}
