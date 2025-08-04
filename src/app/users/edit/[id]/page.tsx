
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, doc, getDoc, updateDoc, getDocs, query, where, initializeFirestore } from 'firebase/firestore';
import { Loader2, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
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
}

interface UserData {
    username: string;
    name: string;
    email: string;
    role: string;
    storeId?: string | null;
    contraseña?: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const userId = params.id as string;
  const [adminUser, setAdminUser] = useState(getCurrentUser());
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [storeId, setStoreId] = useState('unassigned');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!app) {
      setApp(initializeApp(firebaseConfig));
    }
  }, [app]);
  
  // Fetch user data and stores
  useEffect(() => {
    if (!userId || !app) return;
    const db = getFirestore(app);

    const fetchUserData = async () => {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data() as UserData;
            setUsername(data.username);
            setName(data.name);
            setEmail(data.email);
            setRole(data.role);
            setStoreId(data.storeId || 'unassigned');
            // Do not set password for security reasons, only allow updating it
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Usuario no encontrado.' });
            router.push('/users');
        }
    };

    const fetchStores = async () => {
        const storesSnapshot = await getDocs(collection(db, 'stores'));
        const depts = storesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setStores(depts);
    };

    const loadData = async () => {
        setIsLoading(true);
        setIsLoadingStores(true);
        try {
            await Promise.all([fetchUserData(), fetchStores()]);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la información necesaria.' });
        } finally {
            setIsLoading(false);
            setIsLoadingStores(false);
        }
    }
    
    loadData();
  }, [app, userId, router, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !name || !email || !role) {
      toast({ variant: 'destructive', title: 'Campos incompletos', description: 'Nombre de usuario, nombre, email y rol son requeridos.' });
      return;
    }
    if (role === 'Administrador de Tienda' && storeId === 'unassigned') {
        toast({ variant: 'destructive', title: 'Asignación Requerida', description: 'Un Administrador de Tienda debe estar asignado a una tienda.'});
        return;
    }
    if(!app) return;
    setIsSubmitting(true);

    try {
      const db = getFirestore(app);
      
      if (role === 'Administrador de Tienda') {
        const q = query(collection(db, 'users'), where('role', '==', 'Administrador de Tienda'), where('storeId', '==', storeId));
        const existingAdminSnapshot = await getDocs(q);
        const otherAdmin = existingAdminSnapshot.docs.find(doc => doc.id !== userId);
        if (otherAdmin) {
            toast({ variant: 'destructive', title: 'Administrador ya Existe', description: 'Esta tienda ya tiene otro administrador. Solo se permite uno.' });
            setIsSubmitting(false);
            return;
        }
      }

      const userRef = doc(db, 'users', userId);
      const userData: any = {
        username,
        name,
        email,
        role,
        storeId: storeId === 'unassigned' ? null : storeId,
      };

      if (password) {
        userData.contraseña = password;
      }
      
      await updateDoc(userRef, userData);

      toast({ title: 'Usuario Actualizado', description: 'Los cambios se guardaron exitosamente.' });
      router.push('/users');

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
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
            <Button variant="outline" size="sm" asChild>
                <Link href="/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Usuarios
                </Link>
            </Button>
        </div>
        <Card className="max-w-2xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Editar Usuario</CardTitle>
            <CardDescription>
              Modifica los detalles del usuario y guarda los cambios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña (Opcional)</Label>
                 <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Dejar en blanco para no cambiar" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-0 right-1 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">Alternar visibilidad</span>
                    </Button>
                 </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="role">Rol de Usuario</Label>
                  <Select value={role} onValueChange={setRole} required disabled={isSubmitting}>
                      <SelectTrigger id="role">
                          <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Administrador de Tienda">Administrador de Tienda</SelectItem>
                          <SelectItem value="Cajero">Cajero</SelectItem>
                          <SelectItem value="Tomador de Pedido">Tomador de Pedido</SelectItem>
                          <SelectItem value="Repartidor">Repartidor</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="store">Tienda Asignada</Label>
                    <Select value={storeId} onValueChange={setStoreId} disabled={isSubmitting || isLoadingStores}>
                      <SelectTrigger id="store">
                          <SelectValue placeholder={isLoadingStores ? "Cargando tiendas..." : "Selecciona una tienda"} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="unassigned">Sin Asignar</SelectItem>
                          {stores.map(store => (
                              <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
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
