
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, getDocs, onSnapshot, query, addDoc, doc, getDoc } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';

interface Store {
  id: string;
  name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    storeId?: string | null;
    storeName: string;
}

export default function UsersPage() {
  const { user, isLoading: isAuthLoading, app } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // State for adding a new user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [storeId, setStoreId] = useState('unassigned');

  useEffect(() => {
    if (isAuthLoading || !app) return;
    if (user?.name !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    const db = getFirestore(app);
    const fetchStores = async () => {
      try {
        const q = query(collection(db, 'stores'));
        const querySnapshot = await getDocs(q);
        const storesData: Store[] = [];
        querySnapshot.forEach((doc) => {
          storesData.push({ id: doc.id, name: doc.data().name });
        });
        setStores(storesData);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, [user, isAuthLoading, router, app]);

  useEffect(() => {
    if (user?.name !== 'admin' || !app) return;

    const db = getFirestore(app);
    const unsubscribe = onSnapshot(query(collection(db, 'users')), async (snapshot) => {
      setIsDataLoading(true);
      const usersData: User[] = [];
      for (const userDoc of snapshot.docs) {
          const data = userDoc.data();
          let storeName = 'Sin Asignar (Demo)';

          if (data.storeId) {
            try {
              const storeDocRef = doc(db, 'stores', data.storeId);
              const storeDoc = await getDoc(storeDocRef);
              if (storeDoc.exists()) {
                storeName = storeDoc.data().name;
              } else {
                storeName = 'Tienda Eliminada';
              }
            } catch (error) {
              console.error("Error fetching store name:", error);
              storeName = 'Error al cargar';
            }
          }
           usersData.push({
              id: userDoc.id,
              name: data.name,
              email: data.email,
              role: data.role,
              storeId: data.storeId,
              storeName: storeName
          });
      }
      setUsers(usersData);
      setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, app]);


  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, rellena nombre, email, contraseña y rol.",
        });
        return;
    }
    if(!app) return;
    setIsSubmitting(true);
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "users"), {
        name,
        email,
        password, // Ideally, this should be hashed.
        role,
        storeId: storeId === 'unassigned' ? null : storeId,
      });

      toast({
        title: "Usuario Añadido",
        description: `El usuario "${name}" ha sido registrado exitosamente.`,
      });

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      setStoreId('unassigned');

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
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Añade, edita y gestiona los usuarios del sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Añadir Nuevo Usuario</CardTitle>
                <CardDescription>
                  Completa el formulario para registrar un nuevo usuario.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
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
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting}/>
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
                        <Label htmlFor="store">Tienda Asignada (Opcional)</Label>
                         <Select value={storeId} onValueChange={setStoreId} disabled={isSubmitting}>
                            <SelectTrigger id="store">
                                <SelectValue placeholder="Selecciona una tienda" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Sin Asignar (Demo)</SelectItem>
                                {stores.map(store => (
                                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Añadiendo...' : 'Añadir Usuario'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Usuarios</CardTitle>
                 <CardDescription>
                  Esta es la lista de todos los usuarios registrados en el sistema.
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
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Tienda</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-muted-foreground">{user.storeName}</TableCell>
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
