
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, addDoc, getDocs, query, where, initializeFirestore } from 'firebase/firestore';
import { Loader2, PlusCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { getCurrentUser, User } from '@/lib/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { logUserAction } from '@/lib/action-logger';


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

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [app, setApp] = useState(getApps().length > 0 ? getApp() : null);

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for adding a new user
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
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsAuthLoading(false);
  }, [app]);


  useEffect(() => {
    const isAllowed = user?.name === 'admin' || user?.role === 'Superusuario' || user?.role === 'Administrador de Tienda';
    if (isAuthLoading) return;
    if (!isAllowed) {
      router.replace('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const isSuperUser = user?.name === 'admin' || user?.role === 'Superusuario';
    if (!isSuperUser || !app) {
      setIsLoadingStores(false);
      return;
    };

    const fetchStores = async () => {
      setIsLoadingStores(true);
      try {
        const db = getFirestore(app);
        const q = query(collection(db, 'stores'));
        const querySnapshot = await getDocs(q);
        const storesData: Store[] = [];
        querySnapshot.forEach((doc) => {
          storesData.push({ id: doc.id, name: doc.data().name });
        });
        setStores(storesData);
      } catch (error) {
        console.error("Error fetching stores:", error);
        toast({
            variant: "destructive",
            title: "Error de Carga",
            description: "No se pudieron cargar las tiendas.",
        });
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, [user, app, toast]);
  
  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !name || !email || !password || !role || !user) {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, rellena nombre de usuario, nombre, email, contraseña y rol.",
        });
        return;
    }
    const isSuperUser = user?.name === 'admin' || user?.role === 'Superusuario';
    const finalStoreId = isSuperUser ? storeId : user?.storeId;

    if (role === 'Administrador de Tienda' && (!finalStoreId || finalStoreId === 'unassigned')) {
        toast({
            variant: "destructive",
            title: "Asignación Requerida",
            description: "Un Administrador de Tienda debe ser asignado a una tienda existente.",
        });
        return;
    }
    if(!app) return;
    setIsSubmitting(true);

    try {
      const db = getFirestore(app);

      // Security Check: Ensure only one admin per store
      if (role === 'Administrador de Tienda') {
        const q = query(collection(db, "users"), where("role", "==", "Administrador de Tienda"), where("storeId", "==", finalStoreId));
        const existingAdminSnapshot = await getDocs(q);
        if (!existingAdminSnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Administrador ya Existe",
                description: "Esta tienda ya tiene un administrador asignado. Solo se permite uno.",
            });
            setIsSubmitting(false);
            return;
        }
      }

      await addDoc(collection(db, "users"), {
        username,
        name,
        email,
        contraseña: password,
        role,
        storeId: finalStoreId === 'unassigned' ? null : finalStoreId,
        createdBy: user?.name, // Log which admin created this user
      });

      await logUserAction({
          user,
          action: 'CREATE_USER',
          details: `Usuario "${username}" (${role}) creado.`,
          status: 'success'
      });

      toast({
        title: "Usuario Añadido",
        description: `El usuario "${name}" ha sido registrado exitosamente.`,
      });

      router.push('/users');

    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo añadir el usuario. Por favor, inténtalo de nuevo.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !(user?.name === 'admin' || user?.role === 'Superusuario' || user?.role === 'Administrador de Tienda')) {
    return (
      <AppShell>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  const isSuperUser = user?.name === 'admin' || user?.role === 'Superusuario';

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
            <Button variant="outline" size="sm" asChild>
                <Link href="/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la Lista
                </Link>
            </Button>
        </div>
        <Card className="max-w-2xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Añadir Nuevo Usuario</CardTitle>
            <CardDescription>
              Completa el formulario para registrar un nuevo usuario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input id="username" placeholder="Ej: jperez" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" placeholder="Ej: Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="Ej: juan.perez@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                 <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
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
                      <span className="sr-only">Alternar visibilidad de contraseña</span>
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
                            {isSuperUser && <SelectItem value="Administrador de Tienda">Administrador de Tienda</SelectItem>}
                            <SelectItem value="Cajero">Cajero</SelectItem>
                            <SelectItem value="Tomador de Pedido">Tomador de Pedido</SelectItem>
                            <SelectItem value="Repartidor">Repartidor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {isSuperUser && (
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
                )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Añadiendo...' : 'Añadir Usuario'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
