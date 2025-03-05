"use client";

import { useAuth } from "@/context/auth.context";
import AuthService from "@/service/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import nookies from 'nookies';
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const authService = new AuthService();
  const { findAdAccounts } = useAuth();
  const [adAccounts, setAdAccounts] = useState<any>(null);
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter(); // Correção aqui

  useEffect(() => {
    if (code) {
      fetchAdAccounts(code);
    }
  }, [code]);

  const fetchAdAccounts = async (accessToken: string) => {
    try {
      await authService.createTokenFacebook(accessToken);
    } catch (error) {
      console.error("Erro atoken", error);
    }
    try {
      const profile = await authService.getProfile();
      nookies.set(null, 'user', JSON.stringify(profile), { 
        maxAge: 60 * 60 * 24 * 365 * 10,
        path: '/' 
      });
      await findAdAccounts();
      router.push("/dashboard");
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar o profile:", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <h1>{loading ? "loading" : "carregou tudo"}</h1>
      {code ? (
        <>
          <p>Token: {code}</p>
          <button onClick={() => fetchAdAccounts(code)}>
            Recarregar AdAccounts
          </button>
          <pre>{JSON.stringify(adAccounts, null, 2)}</pre>
        </>
      ) : (
        <p>Nenhum token foi fornecido na URL. Faça login primeiro.</p>
      )}
    </div>
  );
}
