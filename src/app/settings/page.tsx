
'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, DollarSign, Bluetooth, Monitor, Printer as PrinterIcon } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data, in a real app this would come from state management or an API
const initialSettings = {
    general: {
      exchangeRate: 1.0,
    },
    printer: {
      printerName: 'system',
      font: 'Courier New',
      fontSize: 10,
      columns: 36,
      useNormalFontForTotals: false,
      useBold: false,
    },
    ticket: {
        headerText: 'Multitienda\nDireccion 123 Col. Colonia\n(555) 123 4567\nRFC0031282AB1',
        footerText: 'Gracias por su compra\nwww.abarrotespuntodeventa.com',
        includeUnitPrice: false,
        printFullDescription: false,
    }
};

const fontOptions = ['Courier New', 'Lucida Console', 'Consolas', 'Monaco'];
const printerProfiles = [
    { value: 'system', label: 'Usar diálogo de impresión del sistema' },
    { value: 'EPSON TM-T20II', label: 'EPSON TM-T20II' },
    { value: 'BIXOLON SRP-350plus', label: 'BIXOLON SRP-350plus' },
    { value: 'Star TSP100', label: 'Star TSP100' },
    { value: 'bluetooth-58mm', label: 'Impresora Bluetooth Portátil (58mm)' },
    { value: 'bluetooth-80mm', label: 'Impresora Bluetooth Portátil (80mm)' }
];

type OperatingSystem = 'android' | 'desktop';

export default function SettingsPage() {
    const [user, setUser] = useState(getCurrentUser());
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [os, setOs] = useState<OperatingSystem>('desktop');
    const [bluetoothPrinter, setBluetoothPrinter] = useState<BluetoothDevice | null>(null);
    const [isSearchingBluetooth, setIsSearchingBluetooth] = useState(false);


    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsAuthLoading(false);

        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes("android")) {
            setOs('android');
        } else {
            setOs('desktop');
        }
    }, []);

    useEffect(() => {
        if (isAuthLoading) return;
        const isAdmin = user?.name === 'admin' || user?.role === 'Superusuario' || user?.role === 'Administrador de Tienda';
        if (!isAdmin) {
            router.replace('/dashboard');
        }
    }, [user, isAuthLoading, router]);

     const handleSave = () => {
        setIsSaving(true);
        console.log("Saving settings:", settings);
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Configuración Guardada",
                description: "Tus cambios se han guardado correctamente.",
            });
        }, 1500);
    };
    
    const handleSearchBluetooth = async () => {
        if (!navigator.bluetooth) {
            toast({
                variant: 'destructive',
                title: 'Bluetooth no Soportado',
                description: 'Tu navegador o dispositivo no es compatible con la Web Bluetooth API.'
            });
            return;
        }

        setIsSearchingBluetooth(true);
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // Generic Attribute Service (often used by printers)
                // acceptAllDevices: true, // Use this for broader discovery if the service filter fails
            });
            setBluetoothPrinter(device);
            toast({
                title: 'Impresora Conectada',
                description: `Se ha enlazado con el dispositivo: ${device.name}`
            });
        } catch (error) {
            console.error('Error al buscar dispositivo Bluetooth:', error);
            toast({
                variant: 'destructive',
                title: 'Búsqueda Cancelada',
                description: 'No se pudo conectar con la impresora Bluetooth.'
            });
        } finally {
            setIsSearchingBluetooth(false);
        }
    };


    if (isAuthLoading || !user || !((user.name === 'admin' || user.role === 'Superusuario' || user.role === 'Administrador de Tienda'))) {
        return (
          <AppShell>
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </AppShell>
        );
    }

    const TicketPreview = () => (
        <Card className="font-mono text-xs p-4 bg-gray-50 dark:bg-gray-800/50 w-full max-w-sm mx-auto shadow-inner">
            <pre className="whitespace-pre-wrap text-center mb-2">{settings.ticket.headerText}</pre>
            <div className="flex justify-between border-t border-dashed border-black dark:border-white pt-1">
                <span>18 de Octubre de 2012</span>
                <span>04:23 pm</span>
            </div>
            <div className="border-b border-dashed border-black dark:border-white pb-1 mb-2"></div>
            <Table>
                <TableBody>
                    <TableRow className="border-none">
                        <TableCell className="p-0">1</TableCell>
                        <TableCell className="p-0">Agua Ciel 600ml</TableCell>
                        <TableCell className="p-0 text-right">$7.00</TableCell>
                    </TableRow>
                     <TableRow className="border-none">
                        <TableCell className="p-0">1</TableCell>
                        <TableCell className="p-0">Coca Cola Light</TableCell>
                        <TableCell className="p-0 text-right">$8.00</TableCell>
                    </TableRow>
                     <TableRow className="border-none">
                        <TableCell className="p-0">1kg</TableCell>
                        <TableCell className="p-0">Tomate</TableCell>
                        <TableCell className="p-0 text-right">$10.00</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div className="border-t border-dashed border-black dark:border-white pt-1 mt-2">
                <div className="flex justify-end">No. de Articulos: 4</div>
                <div className="flex justify-end text-base font-bold">Total: $33.00</div>
            </div>
             <pre className="whitespace-pre-wrap text-center mt-2">{settings.ticket.footerText}</pre>
        </Card>
    );

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">Configuración</h1>
                        <p className="text-muted-foreground">
                            Ajusta las configuraciones del sistema para la impresora y los tickets.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save />}
                        Guardar Cambios
                    </Button>
                </div>
                
                <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-3 max-w-lg">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="printer">Impresora</TabsTrigger>
                        <TabsTrigger value="ticket">Ticket de Venta</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-4">
                        <Card>
                             <CardHeader>
                                <CardTitle>Ajustes Generales</CardTitle>
                                <CardDescription>
                                    Configuraciones globales que afectan a toda la aplicación.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2"><DollarSign/>Tasa de Cambio</CardTitle>
                                    <CardDescription>
                                      Define el valor de 1 Dólar Americano (USD) en tu moneda local.
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                     <div className="space-y-2 max-w-xs">
                                        <Label htmlFor="exchangeRate">1 USD equivale a:</Label>
                                        <Input 
                                            id="exchangeRate" 
                                            type="number"
                                            value={settings.general.exchangeRate}
                                            onChange={(e) => setSettings(s => ({...s, general: { ...s.general, exchangeRate: parseFloat(e.target.value) || 0 }}))}
                                            placeholder="Ej: 36.50"
                                        />
                                    </div>
                                  </CardContent>
                               </Card>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="printer" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Impresora de Tickets</CardTitle>
                                <CardDescription>
                                    Selecciona el método de impresión según tu dispositivo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {os === 'android' ? (
                                    <Alert>
                                        <Bluetooth className="h-4 w-4" />
                                        <AlertTitle>Modo de Impresión Bluetooth</AlertTitle>
                                        <AlertDescription className="space-y-4">
                                           <p>Tu dispositivo Android ha sido detectado. Usa el siguiente botón para buscar y conectar tu impresora de tickets Bluetooth.</p>
                                           <Button onClick={handleSearchBluetooth} disabled={isSearchingBluetooth}>
                                                {isSearchingBluetooth ? <Loader2 className="animate-spin" /> : <Bluetooth />}
                                                {isSearchingBluetooth ? 'Buscando...' : 'Buscar Impresoras Bluetooth'}
                                            </Button>
                                            {bluetoothPrinter && (
                                                <div className="p-3 rounded-md border border-green-500 bg-green-50 dark:bg-green-900/20">
                                                    <p className="font-semibold text-green-700 dark:text-green-300">Impresora enlazada: {bluetoothPrinter.name}</p>
                                                </div>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert>
                                        <Monitor className="h-4 w-4" />
                                        <AlertTitle>Modo de Impresión de Escritorio</AlertTitle>
                                        <AlertDescription className="space-y-4">
                                            <p>Para imprimir en Windows, macOS o Linux, la mejor opción es usar el diálogo de impresión del sistema, que te permite elegir cualquier impresora instalada en tu PC.</p>
                                            <div className="space-y-2">
                                                <Label htmlFor="printerName">Perfil de Impresora</Label>
                                                <Select 
                                                    value={settings.printer.printerName}
                                                    onValueChange={(value) => setSettings(s => ({ ...s, printer: {...s.printer, printerName: value} }))}
                                                >
                                                    <SelectTrigger id="printerName">
                                                        <SelectValue placeholder="Selecciona un perfil" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {printerProfiles.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                <div className="space-y-4 rounded-md border p-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2"><PrinterIcon />Ajustes de Fuente</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label htmlFor="font">Fuente</Label>
                                            <Select 
                                                value={settings.printer.font}
                                                onValueChange={(value) => setSettings(s => ({ ...s, printer: {...s.printer, font: value} }))}
                                            >
                                                <SelectTrigger id="font">
                                                    <SelectValue placeholder="Selecciona una fuente" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fontOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fontSize">Tamaño</Label>
                                            <Input 
                                                id="fontSize" 
                                                type="number" 
                                                value={settings.printer.fontSize}
                                                onChange={(e) => setSettings(s => ({ ...s, printer: {...s.printer, fontSize: parseInt(e.target.value, 10)} }))}
                                                className="w-24"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="columns">Columnas</Label>
                                            <Input 
                                                id="columns" 
                                                type="number" 
                                                value={settings.printer.columns}
                                                onChange={(e) => setSettings(s => ({ ...s, printer: {...s.printer, columns: parseInt(e.target.value, 10)} }))}
                                                className="w-24"
                                            />
                                        </div>
                                    </div>
                                      <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox 
                                            id="use-bold"
                                            checked={settings.printer.useBold}
                                            onCheckedChange={(checked) => setSettings(s => ({ ...s, printer: {...s.printer, useBold: !!checked} }))}
                                        />
                                        <label htmlFor="use-bold" className="text-sm font-medium leading-none">
                                            Poner todas las letras Negritas
                                        </label>
                                    </div>
                                </div>

                              
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ticket" className="mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle>Personalización del Ticket de Venta</CardTitle>
                                <CardDescription>Ajusta el contenido y la apariencia del ticket impreso.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="ticketHeaderText">Texto de Encabezado</Label>
                                        <Textarea 
                                            id="ticketHeaderText"
                                            value={settings.ticket.headerText}
                                            onChange={(e) => setSettings(s => ({...s, ticket: {...s.ticket, headerText: e.target.value}}))}
                                            rows={5}
                                            placeholder="Nombre de la tienda, dirección, RFC..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ticketFooterText">Texto de Pie de Página</Label>
                                        <Textarea 
                                            id="ticketFooterText"
                                            value={settings.ticket.footerText}
                                            onChange={(e) => setSettings(s => ({...s, ticket: {...s.ticket, footerText: e.target.value}}))}
                                            rows={3}
                                            placeholder="Gracias por su compra..."
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="includeUnitPrice"
                                                checked={settings.ticket.includeUnitPrice}
                                                onCheckedChange={(checked) => setSettings(s => ({...s, ticket: {...s.ticket, includeUnitPrice: !!checked}}))}
                                            />
                                            <label htmlFor="includeUnitPrice" className="text-sm font-medium leading-none">Incluir Precio Unitario en la impresión del ticket.</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="printFullDescription"
                                                checked={settings.ticket.printFullDescription}
                                                onCheckedChange={(checked) => setSettings(s => ({...s, ticket: {...s.ticket, printFullDescription: !!checked}}))}
                                            />
                                            <label htmlFor="printFullDescription" className="text-sm font-medium leading-none">Imprimir descripción completa (varios renglones).</label>
                                        </div>
                                         <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="normal-for-totals" 
                                                checked={settings.printer.useNormalFontForTotals}
                                                onCheckedChange={(checked) => setSettings(s => ({ ...s, printer: {...s.printer, useNormalFontForTotals: !!checked} }))}
                                            />
                                            <label htmlFor="normal-for-totals" className="text-sm font-medium leading-none">
                                                Usar fuente "normal" para los totales
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <Label>Vista Previa del Ticket</Label>
                                     <TicketPreview />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}

    