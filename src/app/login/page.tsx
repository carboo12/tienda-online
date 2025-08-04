
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShoppingBasket, Bot, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { login, getCurrentUser } from '@/lib/auth';

const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (getCurrentUser()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        if (!app) {
          throw new Error("La configuración de Firebase no está disponible.");
        }
        const db = getFirestore(app);
        
        // 1. Search for the user in the database (case-insensitive)
        const q = query(collection(db, "masteruser"), where("nombre", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Credenciales inválidas.");
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // 2. Compare passwords
        if (userData.contraseña !== password) {
            throw new Error("Credenciales inválidas.");
        }
        
        // 3. Create "token" (session in localStorage) and grant access
        login({ name: userData.nombre }); // Storing the username as the session identifier

        toast({ title: `¡Bienvenido, ${userData.nombre}!`});
        router.push('/dashboard'); // Redirect after successful login

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error de Inicio de Sesión",
            description: error.message || "Credenciales inválidas. Por favor, inténtalo de nuevo.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBasket className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Administrador MultiTienda</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ej: admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  required
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
                  <span className="sr-only">Alternar visibilidad de contraseña</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : null}
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
