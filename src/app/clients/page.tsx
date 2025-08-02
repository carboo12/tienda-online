
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, addDoc, onSnapshot, query, GeoPoint } from 'firebase/firestore';
import { Loader2, PlusCircle, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';

interface Client {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  balance: number;
}

export default function ClientsPage() {
  const { user, isLoading: isAuthLoading, app } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Form state
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (isAuthLoading || !app) {
      return;
    }
    
    setIsDataLoading(true);
    const db = getFirestore(app);
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const clientsData: Client[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          clientsData.push({
            id: doc.id,
            name: data.name,
            phone: data.phone,
            idNumber: data.idNumber,
            balance: data.balance,
          });
        });
        setClients(clientsData);
        setIsDataLoading(false);
      }, 
      (error) => {
        console.error("Error fetching clients: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los clientes.',
        });
        setIsDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthLoading, router, toast, app]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "GPS no Soportado",
        description: "Tu navegador no permite obtener la geolocalización.",
      });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(new GeoPoint(latitude, longitude));
        toast({
            title: "Ubicación Obtenida",
            description: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location: ", error);
        toast({
            variant: "destructive",
            title: "Error de GPS",
            description: "No se pudo obtener la ubicación. Asegúrate de tener los permisos activados.",
        });
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone || !idNumber || !balance) {
        toast({
            variant: "destructive",
            title: "Campos Requeridos",
            description: "Por favor, completa todos los campos obligatorios.",
        });
        return;
    }
    if (!app) return;

    setIsSubmitting(true);
    
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "clients"), {
        name: clientName,
        phone,
        address,
        idNumber,
        balance: parseFloat(balance) || 0,
        location,
        createdAt: new Date(),
      });

      toast({
        title: "Cliente Añadido",
        description: `El cliente "${clientName}" ha sido registrado exitosamente.`,
      });

      // Reset form
      setClientName('');
      setPhone('');
      setAddress('');
      setIdNumber('');
      setBalance('');
      setLocation(null);

    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo añadir el cliente. Por favor, inténtalo de nuevo.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Añade, edita y gestiona los clientes de tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Añadir Nuevo Cliente</CardTitle>
                <CardDescription>
                  Completa el formulario para registrar un nuevo cliente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente</Label>
                    <Input id="clientName" placeholder="Ej: John Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" placeholder="Ej: 8888-8888" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="idNumber">Cédula de Identidad</Label>
                    <Input id="idNumber" placeholder="Ej: 001-010190-0001A" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="address">Dirección (Opcional)</Label>
                    <Input id="address" placeholder="Ej: De la rotonda, 2 cuadras al sur" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balance">Saldo Pendiente (C$)</Label>
                    <Input id="balance" type="number" placeholder="Ej: 1500.50" value={balance} onChange={(e) => setBalance(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                     <Label>Ubicación GPS</Label>
                     <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation} disabled={isGettingLocation || isSubmitting}>
                        {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MapPin className="mr-2 h-4 w-4"/>}
                        {isGettingLocation ? 'Obteniendo...' : (location ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}` : 'Obtener Ubicación Actual')}
                     </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Añadiendo...' : 'Añadir Cliente'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Registrados</CardTitle>
                 <CardDescription>
                  Esta es la lista de todos los clientes activos.
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
                        <TableHead>Nombre</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Cédula</TableHead>
                        <TableHead className="text-right">Saldo (C$)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                           <TableCell className="text-muted-foreground">{client.idNumber}</TableCell>
                          <TableCell className="text-right">{client.balance.toFixed(2)}</TableCell>
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

