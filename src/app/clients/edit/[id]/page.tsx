
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import { Loader2, Save, MapPin, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';

interface ClientData {
    name: string;
    phone: string;
    address: string;
    idNumber: string;
    balance: number;
    creditLimit: number;
    location?: { latitude: number; longitude: number; };
}

export default function EditClientPage() {
  const { app } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const clientId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Form state
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    if (!app || !clientId) return;

    const fetchClient = async () => {
        setIsLoading(true);
        try {
            const db = getFirestore(app);
            const clientRef = doc(db, 'clients', clientId);
            const clientSnap = await getDoc(clientRef);

            if (clientSnap.exists()) {
                const data = clientSnap.data() as ClientData;
                setClientName(data.name);
                setPhone(data.phone);
                setAddress(data.address || '');
                setIdNumber(data.idNumber);
                setBalance(data.balance.toString());
                setCreditLimit(data.creditLimit.toString());
                if (data.location) {
                    setLatitude(data.location.latitude.toString());
                    setLongitude(data.location.longitude.toString());
                }
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Cliente no encontrado.' });
                router.push('/clients');
            }
        } catch (error) {
            console.error("Error fetching client:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la información del cliente.' });
        } finally {
            setIsLoading(false);
        }
    };

    fetchClient();
  }, [app, clientId, router, toast]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "GPS no Soportado" });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        toast({ title: "Ubicación Obtenida" });
        setIsGettingLocation(false);
      },
      (error) => {
        toast({ variant: "destructive", title: "Error de GPS" });
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone || !idNumber || !balance || !creditLimit || !app) return;

    setIsSubmitting(true);
    
    try {
      const db = getFirestore(app);
      const clientRef = doc(db, 'clients', clientId);
      let location: GeoPoint | null = null;
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (!isNaN(lat) && !isNaN(lon)) {
        location = new GeoPoint(lat, lon);
      }

      await updateDoc(clientRef, {
        name: clientName,
        phone,
        address,
        idNumber,
        balance: parseFloat(balance) || 0,
        creditLimit: parseFloat(creditLimit) || 0,
        location,
      });

      toast({ title: "Cliente Actualizado", description: "Los cambios se guardaron exitosamente." });
      router.push('/clients');

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
                    <Link href="/clients">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a la Lista
                    </Link>
                </Button>
            </div>
            <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Editar Cliente</CardTitle>
                <CardDescription>
                Modifica los datos del cliente y guarda los cambios.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientName">Nombre del Cliente</Label>
                        <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required disabled={isSubmitting}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="idNumber">Cédula de Identidad</Label>
                        <Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required disabled={isSubmitting}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección (Opcional)</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSubmitting}/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="balance">Saldo Pendiente (C$)</Label>
                            <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="creditLimit">Límite de Crédito (C$)</Label>
                            <Input id="creditLimit" type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                    </div>
                    
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-4">
                           <CardTitle className="text-lg">Ubicación GPS (Opcional)</CardTitle>
                           <CardDescription>
                                Actualiza la ubicación con el GPS del dispositivo.
                           </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitud</Label>
                                    <Input id="latitude" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} disabled={isSubmitting}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitud</Label>
                                    <Input id="longitude" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} disabled={isSubmitting}/>
                                </div>
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation} disabled={isGettingLocation || isSubmitting}>
                                {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MapPin className="mr-2 h-4 w-4"/>}
                                {isGettingLocation ? 'Obteniendo...' : 'Actualizar Ubicación con GPS'}
                            </Button>
                        </CardContent>
                    </Card>

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

