
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getFirestore, collection, addDoc, Timestamp, onSnapshot, query, initializeFirestore } from 'firebase/firestore';
import { CalendarIcon, Loader2, PlusCircle, FilePenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { addPendingOperation } from '@/lib/offline-sync';
import { getCurrentUser } from '@/lib/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


interface Store {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email?: string;
  licenseExpires: Date;
}

export default function StoresPage() {
  const router = useRouter();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const [user, setUser] = useState(getCurrentUser());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);


  const [stores, setStores] = useState<Store[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseExpires, setLicenseExpires] = useState<Date>();

  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsAuthLoading(false);
  }, [app]);

  useEffect(() => {
    if (isAuthLoading) return;

    const isAdmin = user?.name === 'admin' || user?.role === 'Superusuario';
    if (!isAdmin) {
      router.replace('/dashboard');
      return;
    }
    
    if (!app) return;

    setIsDataLoading(true);
    const db = getFirestore(app);
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
  }, [user, isAuthLoading, router, toast, app]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!licenseExpires || !storeName || !ownerName || !phone) {
        toast({
            variant: "destructive",
            title: "Campos Requeridos",
            description: "Por favor, completa todos los campos obligatorios.",
        });
        return;
    }
    
    setIsSubmitting(true);

    const storeData = {
        name: storeName,
        owner: ownerName,
        phone,
        email,
        licenseExpires: licenseExpires.toISOString(),
        createdAt: new Date().toISOString(),
    };

    if (isOnline) {
        if (!app) {
            toast({ variant: "destructive", title: "Error de Conexión" });
            setIsSubmitting(false);
            return;
        }
        try {
            const db = getFirestore(app);
            await addDoc(collection(db, "stores"), {
                ...storeData,
                licenseExpires: Timestamp.fromDate(new Date(storeData.licenseExpires)),
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
            toast({ variant: "destructive", title: "Error al Guardar" });
        } finally {
            setIsSubmitting(false);
        }
    } else {
        // Offline
        try {
            await addPendingOperation({
                type: 'ADD_STORE',
                payload: storeData,
                timestamp: new Date().toISOString()
            });
            toast({
                title: "Tienda Guardada Localmente",
                description: `Estás sin conexión. La tienda "${storeName}" se ha guardado y se sincronizará cuando vuelvas a estar en línea.`,
            });
            router.push('/sync');
        } catch (error) {
            console.error("Error saving to offline queue: ", error);
            toast({ variant: "destructive", title: "Error de Guardado Local" });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  if (isAuthLoading || !user || !(user.name === 'admin' || user.role === 'Superusuario')) {
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Gestión de Tiendas</h1>
          <p className="text-muted-foreground text-sm md:text-base">
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
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre Tienda</TableHead>
                          <TableHead className="hidden sm:table-cell">Dueño/a</TableHead>
                          <TableHead>Vencimiento</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.map((store) => (
                          <TableRow key={store.id}>
                            <TableCell className="font-medium">{store.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">{store.owner}</TableCell>
                            <TableCell>{format(store.licenseExpires, "dd/MM/yyyy")}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/stores/edit/${store.id}`}>
                                        <FilePenLine className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
