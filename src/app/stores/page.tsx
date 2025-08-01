
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import app from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { addDoc, collection, getFirestore, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
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

const db = getFirestore(app);

export default function StoresPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [stores, setStores] = useState<Store[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseExpires, setLicenseExpires] = useState<Date>();

  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }
    if (user?.email !== 'admin@example.com') {
      router.replace('/dashboard');
      return;
    }

    const q = query(collection(db, 'stores'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
    }, (error) => {
      console.error("Error fetching stores: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las tiendas.',
      });
      setIsDataLoading(false);
    });

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

  if (isAuthLoading || user?.email !== 'admin@example.com') {
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
                        <TableHead className="text-right">Vencimiento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stores.length > 0 ? (
                        stores.map((store) => (
                          <TableRow key={store.id}>
                            <TableCell className="font-medium">{store.name}</TableCell>
                            <TableCell>{store.owner}</TableCell>
                            <TableCell className="text-muted-foreground">{store.phone}</TableCell>
                            <TableCell className="text-right">{format(store.licenseExpires, "dd/MM/yyyy")}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
    </AppShell>
  );
}
