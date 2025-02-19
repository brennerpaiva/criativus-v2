"use client";

import { userModel } from "@/types/model/user.model";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string;
}

interface AuthContextType {
  user: userModel | null;
  adAccount: AdAccount | null;
  loading: boolean;
  switchAdAccount: (adAccount: AdAccount) => void;
  login: (userData: userModel) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<userModel | null>(null);
  const [adAccount, setAdAccount] = useState<AdAccount| null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Simula uma verificação de login ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAdAccount = localStorage.getItem("activeAdAccount");
    if (storedUser && storedAdAccount) {
      setUser(JSON.parse(storedUser));
      setAdAccount(JSON.parse(storedAdAccount));
    } else {
      setLoading(false);
    }
  }, []);

  // Login do usuário
  const login = (userData: userModel) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // fetchAdAccounts();
  };

  // Logout do usuário
  const logout = () => {
    setUser(null);
    setAdAccount(null);
    localStorage.removeItem("user");
  };

  const switchAdAccount = (AdAccount: AdAccount) => {
    const storedAdAccount = localStorage.getItem("activeAdAccount");
    if (!storedAdAccount) {
      return;
    }
    localStorage.setItem('activeAdAccount', JSON.stringify(AdAccount));
    console.log(AdAccount)
    setAdAccount(AdAccount);
  }

  return (
    <AuthContext.Provider value={{ user, adAccount, loading, switchAdAccount, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
