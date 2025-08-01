
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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12.27V14.4H18.16C17.86 16.03 16.96 17.41 15.58 18.34V21.09H19.45C21.49 19.22 22.56 16.03 22.56 12.25Z" fill="#4285F4"/>
      <path d="M12.27 23C15.02 23 17.34 22.09 19.45 20.53L15.58 17.78C14.63 18.42 13.52 18.79 12.27 18.79C9.86 18.79 7.8 17.29 6.99 15.14H3V17.9C4.96 20.91 8.32 23 12.27 23Z" fill="#34A853"/>
      <path d="M6.99 15.14C6.79 14.56 6.68 13.94 6.68 13.3C6.68 12.66 6.79 12.04 6.99 11.46V8.71H3C2.36 9.96 2 11.58 2 13.3C2 15.02 2.36 16.64 3 17.9L6.99 15.14Z" fill="#FBBC05"/>
      <path d="M12.27 6.21C13.62 6.21 14.77 6.69 15.82 7.68L19.53 4C17.34 2.23 15.02 1 12.27 1C8.32 1 4.96 3.09 3 6.1L6.99 8.86C7.8 6.71 9.86 6.21 12.27 6.21Z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, loginWithGoogle, user, isLoading } = useAuth();
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
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: "Correo electrónico o contraseña inválidos. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión con Google",
        description: "No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.",
      });
    }
  }

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
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    O
                    </span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
               <GoogleIcon className="mr-2 h-5 w-5" />
                Iniciar Sesión con Google
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
