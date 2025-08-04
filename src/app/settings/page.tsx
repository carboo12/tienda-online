
'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// Mock data, in a real app this would come from state management or an API
const printerSettings = {
  printerName: 'EPSON TM-T20II',
  font: 'Courier New',
  fontSize: 10,
  columns: 36,
  useNormalFontForTotals: false,
  useBold: false,
};

const fontOptions = ['Courier New', 'Lucida Console', 'Consolas', 'Monaco'];
const printerOptions = ['Predeterminada del sistema', 'EPSON TM-T20II', 'BIXOLON SRP-350plus', 'Star TSP100'];


export default function SettingsPage() {
    const [user, setUser] = useState(getCurrentUser());
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const router = useRouter();

    // In a real app, you would fetch and save these settings.
    // For now, we'll just manage them in local state.
    const [settings, setSettings] = useState(printerSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsAuthLoading(false);
    }, []);

    useEffect(() => {
        if (!isAuthLoading && user?.name !== 'admin') {
            router.replace('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate saving settings
        console.log("Saving settings:", settings);
        setTimeout(() => {
            setIsSaving(false);
            // Here you would show a toast notification on success
        }, 1500);
    }
    
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Configuración</h1>
                    <p className="text-muted-foreground">
                        Ajusta las configuraciones del sistema.
                    </p>
                </div>
                
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Impresora de Tickets</CardTitle>
                        <CardDescription>
                            Por favor elige la impresora de tickets entre las impresoras instaladas en tu sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Label htmlFor="printerName">Impresora de Tickets</Label>
                           <Select 
                                value={settings.printerName}
                                onValueChange={(value) => setSettings(s => ({ ...s, printerName: value }))}
                            >
                                <SelectTrigger id="printerName">
                                    <SelectValue placeholder="Selecciona una impresora" />
                                </SelectTrigger>
                                <SelectContent>
                                    {printerOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                        
                        <div className="space-y-4 rounded-md border p-4">
                            <h3 className="font-semibold text-lg">Fuente de Impresión Normal</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="font">Fuente</Label>
                                    <Select 
                                        value={settings.font}
                                        onValueChange={(value) => setSettings(s => ({ ...s, font: value }))}
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
                                        value={settings.fontSize}
                                        onChange={(e) => setSettings(s => ({ ...s, fontSize: parseInt(e.target.value, 10) }))}
                                        className="w-24"
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="columns">Columnas</Label>
                                    <Input 
                                        id="columns" 
                                        type="number" 
                                        value={settings.columns}
                                        onChange={(e) => setSettings(s => ({ ...s, columns: parseInt(e.target.value, 10) }))}
                                        className="w-24"
                                    />
                                </div>
                            </div>
                        </div>

                         <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="normal-for-totals" 
                                    checked={settings.useNormalFontForTotals}
                                    onCheckedChange={(checked) => setSettings(s => ({ ...s, useNormalFontForTotals: !!checked }))}
                                />
                                <label
                                    htmlFor="normal-for-totals"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Usar fuente "normal" para los totales
                                </label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="use-bold"
                                    checked={settings.useBold}
                                    onCheckedChange={(checked) => setSettings(s => ({ ...s, useBold: !!checked }))}
                                />
                                <label
                                    htmlFor="use-bold"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Poner todas las letras Negritas
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </AppShell>
    );
}
