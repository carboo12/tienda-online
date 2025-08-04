
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, addDoc, GeoPoint } from 'firebase/firestore';
import { Loader2, PlusCircle, MapPin, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { addPendingOperation } from '@/lib/offline-sync';
import { getApps, getApp, initializeApp } from 'firebase/app';

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

export default function NewClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setLatitude(latitude.toString());
        setLongitude(longitude.toString());
        toast({
            title: "Ubicación Obtenida",
            description: `Latitud y Longitud han sido rellenadas.`,
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
    if (!clientName || !phone || !idNumber || !balance || !creditLimit) {
        toast({
            variant: "destructive",
            title: "Campos Requeridos",
            description: "Por favor, completa todos los campos obligatorios.",
        });
        return;
    }
    
    setIsSubmitting(true);

    let locationData: { latitude: number; longitude: number; } | null = null;
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
        locationData = { latitude: lat, longitude: lon };
    }

    const clientData = {
        name: clientName,
        phone,
        address,
        idNumber,
        balance: parseFloat(balance) || 0,
        creditLimit: parseFloat(creditLimit) || 0,
        location: locationData,
        createdAt: new Date().toISOString(), // Use ISO string for IndexedDB compatibility
    };

    if (isOnline) {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        if (!app) {
            toast({ variant: "destructive", title: "Error de Conexión", description: "La conexión con la base de datos no está disponible."});
            setIsSubmitting(false);
            return;
        }
        try {
            const db = getFirestore(app);
            const location = clientData.location ? new GeoPoint(clientData.location.latitude, clientData.location.longitude) : null;
            
            await addDoc(collection(db, "clients"), {
                ...clientData,
                location,
                createdAt: new Date(clientData.createdAt), // Convert back to Date object for Firestore
            });

            toast({
                title: "Cliente Añadido",
                description: `El cliente "${clientName}" ha sido registrado exitosamente.`,
            });
            router.push('/clients');

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
    } else {
        // We are offline
        try {
            await addPendingOperation({
                type: 'ADD_CLIENT',
                payload: clientData,
                timestamp: new Date().toISOString()
            });
            toast({
                title: "Cliente Guardado Localmente",
                description: `Estás sin conexión. El cliente "${clientName}" se ha guardado y se sincronizará cuando vuelvas a estar en línea.`,
            });
            router.push('/clients');
        } catch (error) {
            console.error("Error saving to offline queue: ", error);
            toast({
                variant: "destructive",
                title: "Error de Guardado Local",
                description: "No se pudo guardar el cliente localmente.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="balance">Saldo Pendiente (C$)</Label>
                            <Input id="balance" type="number" placeholder="Ej: 1500.50" value={balance} onChange={(e) => setBalance(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="creditLimit">Límite de Crédito (C$)</Label>
                            <Input id="creditLimit" type="number" placeholder="Ej: 5000" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                    </div>
                    
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-4">
                           <CardTitle className="text-lg">Ubicación GPS (Opcional)</CardTitle>
                           <CardDescription>
                                Obtén la ubicación con el GPS del dispositivo o ingrésala manually.
                           </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitud</Label>
                                    <Input id="latitude" type="number" step="any" placeholder="Ej: 12.1328" value={latitude} onChange={(e) => setLatitude(e.target.value)} disabled={isSubmitting}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitud</Label>
                                    <Input id="longitude" type="number" step="any" placeholder="Ej: -86.2504" value={longitude} onChange={(e) => setLongitude(e.target.value)} disabled={isSubmitting}/>
                                </div>
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation} disabled={isGettingLocation || isSubmitting}>
                                {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MapPin className="mr-2 h-4 w-4"/>}
                                {isGettingLocation ? 'Obteniendo...' : 'Obtener Ubicación Actual con GPS'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {isSubmitting ? 'Guardando...' : 'Agregar'}
                    </Button>
                </form>
            </CardContent>
            </Card>
        </div>
    </AppShell>
  );
}
