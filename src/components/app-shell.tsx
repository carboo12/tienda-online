
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Box,
  FileText,
  Home,
  Menu,
  Package,
  ShoppingBasket,
  Store,
  Users,
  ClipboardList,
  Bot,
  UsersRound,
} from 'lucide-react';
import { UserNav } from './user-nav';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface AppShellProps {
  children: React.ReactNode;
}

const mainNavItems = [
  { href: '/dashboard', icon: Home, label: 'Panel de Control' },
  { href: '/invoices', icon: FileText, label: 'Facturación' },
  { href: '/inventory', icon: Box, label: 'Inventario' },
  { href: '/orders', icon: Package, label: 'Pedidos' },
  { href: '/clients', icon: UsersRound, label: 'Clientes' },
  { href: '/reports', icon: BarChart, label: 'Informes IA' },
];

const adminNavItems = [
  { href: '/stores', icon: Store, label: 'Tiendas' },
  { href: '/users', icon: Users, label: 'Usuarios' },
  { href: '/log', icon: ClipboardList, label: 'Registro de Acciones' },
];

export function AppShell({ children }: AppShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Bot className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderNavLinks = (isMobile = false) => {
    const isAdmin = user?.name === 'admin';
    
    const navLink = (item: { href: string; icon: React.ElementType; label: string; }) => (
      <Button
        key={item.href}
        variant={pathname === item.href ? 'secondary' : 'ghost'}
        className="justify-start"
        asChild
        onClick={() => isMobile && setMobileNavOpen(false)}
      >
        <Link href={item.href}>
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      </Button>
    );

    return (
      <nav className={cn("flex flex-col gap-1 p-2", isMobile && "p-4")}>
        {mainNavItems.map(navLink)}
        {isAdmin && (
          <>
            <Separator className="my-2" />
            <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground tracking-wider">Administración</h4>
            {adminNavItems.map(navLink)}
          </>
        )}
      </nav>
    );
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <ShoppingBasket className="h-6 w-6 text-primary" />
              <span className="">MultiTienda</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
           {renderNavLinks()}
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menú de navegación</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0" title="Navigation Menu">
               <div className="flex h-14 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setMobileNavOpen(false)}>
                  <ShoppingBasket className="h-6 w-6 text-primary" />
                  <span className="">MultiTienda</span>
                </Link>
              </div>
              <div className="overflow-y-auto">
                {renderNavLinks(true)}
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search or breadcrumbs here */}
          </div>
          <ThemeToggle />
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
