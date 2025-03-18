"use client"

import { ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useAuth } from "@/context/auth.context"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { user, activeAdAccount, adAccounts, switchAdAccount, findAdAccounts } = useAuth()

  // Estado local para armazenar o texto digitado no campo de busca
  const [searchTerm, setSearchTerm] = useState("")

  // Se o usuário estiver logado e a lista de contas estiver vazia, dispara a busca.
  useEffect(() => {
    if (user && user.accessTokenFb && (adAccounts === null || adAccounts.length === 0)) {
      findAdAccounts()
    }
  }, [user, adAccounts, findAdAccounts])

  // Filtra as contas pelo campo de busca
  const filteredAdAccounts =
    adAccounts?.filter((account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? []

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
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
            className="mt-1 mb-1 w-[--radix-dropdown-menu-trigger-width] min-w-56 max-h-[95vh] overflow-y-auto rounded-lg"
            
            // Impede que o dropdown tente re-focar algo ao fechar
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {/* 
              Div para o input de busca.
              onKeyDown para parar a propagação e desativar a "typeahead" do menu.
            */}
            <div
              className="px-2 py-1"
              onKeyDown={(e) => {
                e.stopPropagation()
              }}
            >
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar conta..."
                className="
                  w-full
                  rounded-sm
                  border
                  border-input
                  bg-background
                  p-1
                  text-sm
                  placeholder:text-muted-foreground
                  focus:outline-none
                "
              />
            </div>

            <DropdownMenuSeparator />

            {/* Se ainda estiver carregando as contas */}
            {adAccounts === null ? (
              <DropdownMenuItem className="flex items-center p-2 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </DropdownMenuItem>
            ) : filteredAdAccounts.length === 0 ? (
              // Se não houver contas ou nenhuma bate com o filtro
              <DropdownMenuItem className="p-2 text-sm text-muted-foreground">
                Nenhuma conta disponível
              </DropdownMenuItem>
            ) : (
              // Caso contrário, mostra as contas filtradas
              filteredAdAccounts.map((account, index) => (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => {
                    switchAdAccount(account)
                    // Se quiser fechar o dropdown após selecionar, não chame preventDefault.
                  }}
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
                <Plus className="h-4 w-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
