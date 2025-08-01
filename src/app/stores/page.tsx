
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';

const mockStores = [
  { id: '1', name: 'Tienda A', owner: 'Ana García', phone: '123-456-7890', licenseExpires: new Date() },
  { id: '2', name: 'Tienda B', owner: 'Carlos Martínez', phone: '098-765-4321', licenseExpires: new Date() },
];

export default function StoresPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseExpires, setLicenseExpires] = useState<Date>();

  useEffect(() => {
    if (!isLoading && user?.email !== 'admin@example.com') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);
  
  const handleAddStore = (e: FormEvent) => {
    e.preventDefault();
    const storeData = {
        storeName,
        ownerName,
        phone,
        email,
        licenseExpires: licenseExpires ? format(licenseExpires, "PPP") : 'N/A'
    };
    
    alert(`Tienda a añadir:\n${JSON.stringify(storeData, null, 2)}`);
    
    toast({
        title: "Tienda Añadida (Simulación)",
        description: `La tienda "${storeName}" se ha añadido. La conexión a la base de datos se implementará a continuación.`,
    });

    // Reset form
    setStoreName('');
    setOwnerName('');
    setPhone('');
    setEmail('');
    setLicenseExpires(undefined);
  };

  if (isLoading || !user || user.email !== 'admin@example.com') {
    return <AppShell><div>Cargando...</div></AppShell>;
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
                    <Input id="storeName" placeholder="Ej: Moda Exclusiva" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nombre del Dueño/a</Label>
                    <Input id="ownerName" placeholder="Ej: Carolina Herrera" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" placeholder="Ej: 555-123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
                    <Input id="email" type="email" placeholder="Ej: contacto@moda.com" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Tienda
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
                    {mockStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>{store.owner}</TableCell>
                        <TableCell className="text-muted-foreground">{store.phone}</TableCell>
                        <TableCell className="text-right">{format(store.licenseExpires, "dd/MM/yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
