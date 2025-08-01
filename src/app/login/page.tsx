
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
import { Eye, EyeOff, ShoppingBasket, Bot } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/contexts/auth-provider';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (username.toLowerCase() === 'admin' && password === 'Id14304++') {
        try {
            const db = getFirestore(app);
            const q = query(collection(db, "masteruser"), where("nombre", "==", username.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("Usuario no encontrado.");
            }

            let userFound = false;
            querySnapshot.forEach((doc) => {
                if (doc.data().contraseña === password) {
                    login({ name: doc.data().nombre });
                    router.push('/dashboard');
                    userFound = true;
                }
            });

            if (!userFound) {
                 throw new Error("Contraseña incorrecta.");
            }

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error de Inicio de Sesión",
                description: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
            });
        } finally {
            setIsSubmitting(false);
        }
    } else {
         toast({
            variant: "destructive",
            title: "Error de Inicio de Sesión",
            description: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
        });
        setIsSubmitting(false);
    }
  };

  if (isLoading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Bot className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
