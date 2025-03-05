'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth.context";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useEffect } from "react";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { user, activeAdAccount, adAccounts, switchAdAccount, findAdAccounts } = useAuth();

  // Se o usuário estiver logado e a lista de empresas estiver vazia, dispara a busca.
  useEffect(() => {
    console.log(user)
    if (user && user.accessTokenFb && (adAccounts === null || adAccounts.length === 0)) {
      findAdAccounts();
    }
  }, [user, adAccounts, findAdAccounts]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {/* Ícone ou logo da conta */}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeAdAccount?.name || "Selecione uma conta"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg mt-1 mb-1 max-h-screen overflow-y-auto"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {adAccounts === null ? (
              <DropdownMenuItem className="p-2 text-sm text-muted-foreground flex items-center">
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Carregando...
              </DropdownMenuItem>
            ) : adAccounts.length === 0 ? (
              <DropdownMenuItem className="p-2 text-sm text-muted-foreground">
                Nenhuma conta disponível
              </DropdownMenuItem>
            ) : (
              adAccounts.map((account, index) => (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => switchAdAccount(account)}
                  className="gap-2 p-2"
                >
                  <div className="flex w-6 items-center justify-center rounded-sm border">
                    {/* Ícone ou logo da conta */}
                  </div>
                  {account.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex w-6 items-center justify-center rounded-md border bg-background">
                <Plus className="w-4 h-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
