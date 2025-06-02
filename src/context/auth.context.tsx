'use client';

import AuthService from '@/service/auth.service';
import FacebookAdsService from '@/service/graph-api.service';
import ReportService from '@/service/report.service';
import { useReportStore } from '@/store/report/user-report.store';
import { userModel } from '@/types/model/user.model';
import { useRouter } from 'next/navigation';
import nookies from 'nookies';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string;
}

interface AuthContextType {
  user: userModel | null;
  userToken: string | null;
  activeAdAccount: AdAccount | null;
  adAccounts: AdAccount[] | null;
  loading: boolean;
  findAdAccounts: () => Promise<void>;
  switchAdAccount: (adAccount: AdAccount) => void;
  login: (formData: any) => Promise<void>;
  loginWithFacebook: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<userModel | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<AdAccount[] | null>(null);
  const [activeAdAccount, setActiveAdAccount] = useState<AdAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setReports, reports } = useReportStore();

  const authService = new AuthService();

  // Reidratação dos dados do usuário a partir dos cookies
  useEffect(() => {
    const cookies = nookies.get(null);
    if (cookies.user) {
      try {
        setUser(JSON.parse(cookies.user));
      } catch (err) {
        console.error("Erro ao fazer parse do cookie 'user':", err);
      }
    }
    if (cookies.userToken) {
      setUserToken(cookies.userToken);
    }
    if (cookies.activeAdAccount) {
      try {
        setActiveAdAccount(JSON.parse(cookies.activeAdAccount));
      } catch (err) {
        console.error("Erro ao fazer parse do cookie 'activeAdAccount':", err);
      }
    }
    setLoading(false);
  }, []); // Remova [adAccounts]

  const findAdAccounts = useCallback(async () => {
    try {
      const adAccountsUser = await FacebookAdsService.getAdAccounts();
      const accounts = adAccountsUser || [];
      setAdAccounts(accounts);
  
      // Recupera o activeAdAccount atual do estado ou do cookie
      const cookies = nookies.get(null);
      let currentActiveAdAccount = activeAdAccount;
      if (!currentActiveAdAccount && cookies.activeAdAccount) {
        currentActiveAdAccount = JSON.parse(cookies.activeAdAccount);
      }
  
      // Verifica se o activeAdAccount atual existe na nova lista de contas
      const isValidActiveAdAccount = currentActiveAdAccount && accounts.some(
        (account) => account.id === currentActiveAdAccount.id
      );
  
      // Define o activeAdAccount apenas se não houver um válido
      if (!isValidActiveAdAccount && accounts.length > 0) {
        const firstAdAccount = accounts[0];
        setActiveAdAccount(firstAdAccount);
        nookies.set(null, 'activeAdAccount', JSON.stringify(firstAdAccount), {
          maxAge: 60 * 60 * 24 * 365 * 10,
          path: '/',
        });
      } else if (isValidActiveAdAccount) {
        setActiveAdAccount(currentActiveAdAccount); // Mantém o existente
      }
    } catch (error) {
      console.error('Erro ao buscar contas de anúncio:', error);
    }
  }, [activeAdAccount]); // Adicione activeAdAccount como dependência

  const findReports= useCallback(async () => {
    try {
      const reportsUser = await ReportService.listReports() || [];
      setReports(reportsUser);
    } catch (error) {
      console.error('Erro ao buscar reports do usuário:', error);
    }
  }, [setReports]);
  
  // Função de login padrão (ex.: com formulário)
  const login = useCallback(async (formData: any) => {
   
      const token = await authService.login(formData);
      nookies.set(null, 'access_token', token, { 
        maxAge: 60 * 60 * 24 * 365 * 10,
        path: '/' 
      });
      setUserToken(token);
      
      const profile = await authService.getProfile();
      nookies.set(null, 'user', JSON.stringify(profile), { 
        maxAge: 60 * 60 * 24 * 365 * 10,
        path: '/' 
      });
      setUser(profile);
      
      if (profile.accessTokenFb) {
        await findReports();
        await findAdAccounts();
      } else {
        return await loginWithFacebook();
      }
      router.push('/top-criativos-vendas');
   
  }, [authService, findAdAccounts, router]);

  // Nova função para login com Facebook (redirecionamento)
  const loginWithFacebook = useCallback(() => {
    const FB_APP_ID      = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";
    const REDIRECT_URI   = "https://ads-analytics.vercel.app/login-facebook";
    const state          = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  
    const params = new URLSearchParams({
      client_id: FB_APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      display: "popup",
      state: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      scope: [
        "public_profile",
        "email",
        "pages_show_list",        // exibe a lista de Páginas
        "pages_read_engagement",
        "ads_read",               // relatórios de Ads
        "ads_management"          // (opcional) gerenciar campanhas
      ].join(","),
    });
    
    window.open(
      `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`,
      "fbAuth",
      "popup=yes,width=600,height=700"
    );
    
  }, []);
  
  

  const logout = useCallback(() => {
    router.push('/sign-in');
    const cookies = nookies.get(null);
    Object.keys(cookies).forEach(cookieName => {
      nookies.destroy(null, cookieName);
    });
    localStorage.clear();
    sessionStorage.clear();
  }, [router]);

  const switchAdAccount = useCallback((adAccount: AdAccount) => {
    nookies.set(null, 'activeAdAccount', JSON.stringify(adAccount), { 
      maxAge: 60 * 60 * 24 * 365 * 10,
      path: '/' 
    });
    setActiveAdAccount(adAccount);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        activeAdAccount,
        adAccounts,
        loading,
        findAdAccounts,
        switchAdAccount,
        login,
        loginWithFacebook,
        logout,
      }}
    >
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
