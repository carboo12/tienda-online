
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { CalendarIcon, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { getApps, getApp, initializeApp } from 'firebase/app';

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

interface StoreData {
    name: string;
    owner: string;
    phone: string;
    email?: string;
    licenseExpires: Timestamp;
}

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const storeId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseExpires, setLicenseExpires] = useState<Date>();

  useEffect(() => {
    if (!storeId) return;
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    const fetchStore = async () => {
        setIsLoading(true);
        try {
            const db = getFirestore(app);
            const storeRef = doc(db, 'stores', storeId);
            const storeSnap = await getDoc(storeRef);

            if (storeSnap.exists()) {
                const data = storeSnap.data() as StoreData;
                setStoreName(data.name);
                setOwnerName(data.owner);
                setPhone(data.phone);
                setEmail(data.email || '');
                setLicenseExpires(data.licenseExpires.toDate());
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Tienda no encontrada.' });
                router.push('/stores');
            }
        } catch (error) {
            console.error("Error fetching store:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la información de la tienda.' });
        } finally {
            setIsLoading(false);
        }
    };

    fetchStore();
  }, [storeId, router, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!licenseExpires || !storeName || !ownerName || !phone) {
        toast({ variant: "destructive", title: "Campos Requeridos" });
        return;
    }

    setIsSubmitting(true);
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    try {
      const db = getFirestore(app);
      const storeRef = doc(db, 'stores', storeId);
      
      await updateDoc(storeRef, {
        name: storeName,
        owner: ownerName,
        phone,
        email,
        licenseExpires: Timestamp.fromDate(licenseExpires),
      });

      toast({ title: "Tienda Actualizada", description: "Los cambios se guardaron exitosamente." });
      router.push('/stores');

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
                    <Link href="/stores">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a la Lista
                    </Link>
                </Button>
            </div>
            <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Editar Tienda</CardTitle>
                <CardDescription>
                Modifica los datos de la tienda y guarda los cambios.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nombre de la Tienda</Label>
                    <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nombre del Dueño/a</Label>
                    <Input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting}/>
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
                              {licenseExpires ? format(licenseExpires, "PPP") : <span>Selecciona una fecha</span>}
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
