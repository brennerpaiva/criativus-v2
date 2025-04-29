'use client';
import { Home, LineChart, Package, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/custom/combobox';

export function SidebarUserComponent() {
  interface ComboboxItem {
    id: string;
    nome: string;
    value: string;
    label: string;
    avatarUrl?: string;
  }

  const frameworks: ComboboxItem[] = [
    {
      id: '1',
      nome: 'Next.js Nome nome teste lldasd asdlkasd ',
      value: 'next.js',
      label: 'Next.js brenenrnerj asjdhasjkdha ajksdhasjhd',
      avatarUrl: 'https://avatars.githubusercontent.com/u/114958953?v=4',
    },
    {
      id: '2',
      nome: 'SvelteKit',
      value: 'sveltekit',
      label: 'SvelteKit',
      avatarUrl: 'https://example.com/sveltekit-avatar.jpg',
    },
    {
      id: '3',
      nome: 'Nuxt.js',
      value: 'nuxt.js',
      label: 'Nuxt.js',
      avatarUrl: 'https://example.com/nuxtjs-avatar.jpg',
    },
    {
      id: '4',
      nome: 'Remix',
      value: 'remix',
      label: 'Remix',
      avatarUrl: 'https://example.com/remix-avatar.jpg',
    },
    {
      id: '5',
      nome: 'Astro',
      value: 'astro',
      label: 'Astro',
      avatarUrl: 'https://example.com/astro-avatar.jpg',
    },
  ];

  const handleSelect = (item: ComboboxItem) => {
    // console.log('Selected item:', item);
  };

  return (
    <div className="fixed top-0 border-r bg-muted/40 hidden h-screen w-full shrink-0 md:sticky md:block">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Combobox
          items={frameworks}
          onSelect={handleSelect}
          placeholder="Pesquisar..."
          groupHeading="Contas ADS"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Top criativos da semana
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-3 text-primary transition-all hover:text-primary"
          >
            <Package className="h-4 w-4" />
            Top Criativos
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary"
          >
            <ShoppingCart className="h-4 w-4" />
            Orders
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              6
            </Badge>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary"
          >
            <Users className="h-4 w-4" />
            Customers
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary"
          >
            <LineChart className="h-4 w-4" />
            Analytics
          </Link>
        </nav>
      </div>
      <div className="p-4">
        <Card>
          <CardHeader className="p-2 pt-0 md:p-4">
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Unlock all features and get unlimited access to our support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
