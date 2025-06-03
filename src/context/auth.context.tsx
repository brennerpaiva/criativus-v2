'use client';

import { useFacebookSdk } from '@/hooks/useFacebookSdk';
import AuthService from '@/service/auth.service';
import FacebookAdsService from '@/service/graph-api.service';
import ReportService from '@/service/report.service';
import { useReportStore } from '@/store/report/user-report.store';
import { userModel } from '@/types/model/user.model';
import { useRouter } from 'next/navigation';
import nookies from 'nookies';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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

  const { setReports } = useReportStore();
  const authService = new AuthService();

  /** ------------------------------------------------------------------
   *  1. Hidratando cookies -> estado
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const cookies = nookies.get(null);

    if (cookies.user) {
      try {
        setUser(JSON.parse(cookies.user));
      } catch (err) {
        console.error("Erro ao fazer parse do cookie 'user':", err);
      }
    }

    if (cookies.userToken) setUserToken(cookies.userToken);

    if (cookies.activeAdAccount) {
      try {
        setActiveAdAccount(JSON.parse(cookies.activeAdAccount));
      } catch (err) {
        console.error("Erro ao fazer parse do cookie 'activeAdAccount':", err);
      }
    }

    setLoading(false);
  }, []);

  /** ------------------------------------------------------------------
   *  2. Facebook Ad Accounts
   * ------------------------------------------------------------------ */
  const findAdAccounts = useCallback(async () => {
    try {
      const accounts = (await FacebookAdsService.getAdAccounts()) || [];
      setAdAccounts(accounts);

      // Se não houver act-acct válido, assumir o primeiro
      const cookies = nookies.get(null);
      const saved = cookies.activeAdAccount
        ? JSON.parse(cookies.activeAdAccount)
        : null;

      const valid =
        saved && accounts.some((acc) => acc.id === saved.id) ? saved : null;

      const selected = valid ?? accounts[0] ?? null;
      if (selected) {
        setActiveAdAccount(selected);
        nookies.set(null, 'activeAdAccount', JSON.stringify(selected), {
          maxAge: 60 * 60 * 24 * 365 * 10,
          path: '/',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar contas de anúncio:', error);
    }
  }, []);

  /** ------------------------------------------------------------------
   *  3. Reports
   * ------------------------------------------------------------------ */
  const findReports = useCallback(async () => {
    try {
      const reports = (await ReportService.listReports()) || [];
      setReports(reports);
    } catch (error) {
      console.error('Erro ao buscar reports do usuário:', error);
    }
  }, [setReports]);

  /** ------------------------------------------------------------------
   *  4. Login tradicional (form + email/senha)
   * ------------------------------------------------------------------ */
  const login = useCallback(
    async (formData: any) => {
      // 4.1 Faz login na sua API
      const token = await authService.login(formData);
      nookies.set(null, 'access_token', token, {
        maxAge: 60 * 60 * 24 * 365 * 10,
        path: '/',
      });
      setUserToken(token);

      // 4.2 Carrega perfil
      const profile = await authService.getProfile();
      nookies.set(null, 'user', JSON.stringify(profile), {
        maxAge: 60 * 60 * 24 * 365 * 10,
        path: '/',
      });
      setUser(profile);

      // 4.3 Se já tiver token do Facebook salvo → buscar dados,
      //      senão, iniciar o login via Facebook
      if (profile.accessTokenFb) {
        await findReports();
        await findAdAccounts();
      } else {
        loginWithFacebook();
        return;
      }

      router.push('/top-criativos-vendas');
    },
    [authService, findAdAccounts, findReports, router],
  );

  /** ------------------------------------------------------------------
   *  5. Login com Facebook — JavaScript SDK
   * ------------------------------------------------------------------ */
  const fbReady = useFacebookSdk();

  const loginWithFacebook = useCallback(() => {
    if (!fbReady) return; // SDK ainda não carregou

    (window as any).FB.login(
      async (
        response: fb.StatusResponse & {
          code?: string;
        },
      ) => {
       console.log(response);
      },
      {
        scope: 'ads_read,pages_read_engagement',
        config_id: '1049856977152677',
        response_type: 'code',
      },
    );
  }, [fbReady, authService, findAdAccounts, findReports, router]);

  /** ------------------------------------------------------------------
   *  6. Logout
   * ------------------------------------------------------------------ */
  const logout = useCallback(() => {
    router.push('/sign-in');
    const cookies = nookies.get(null);
    Object.keys(cookies).forEach((name) => nookies.destroy(null, name));
    localStorage.clear();
    sessionStorage.clear();
  }, [router]);

  /** ------------------------------------------------------------------
   *  7. Trocar conta de anúncio
   * ------------------------------------------------------------------ */
  const switchAdAccount = useCallback((adAccount: AdAccount) => {
    nookies.set(null, 'activeAdAccount', JSON.stringify(adAccount), {
      maxAge: 60 * 60 * 24 * 365 * 10,
      path: '/',
    });
    setActiveAdAccount(adAccount);
  }, []);

  /** ------------------------------------------------------------------
   *  8. Provedor
   * ------------------------------------------------------------------ */
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

/**
 * Hook para consumo do contexto
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
