"use client";

import { useAuth } from "@/context/auth.context";
import AuthService from "@/service/auth.service";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import nookies from "nookies";
import { Suspense, useEffect, useState } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const authService = new AuthService();
  const { findAdAccounts } = useAuth();
  const [adAccounts, setAdAccounts] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const router = useRouter();

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
      nookies.set(null, "user", JSON.stringify(profile), {
        maxAge: 60 * 60 * 24 * 365 * 10,
        path: "/",
      });
      setLoading(false);
      await findAdAccounts();
      router.push("/top-criativos-vendas");
    } catch (error) {
      console.error("Erro ao buscar o profile:", error);
    }
  };

  return (
    <div className="w-full h-screen lg:grid">
          <div className="flex h-full items-center justify-center py-12">
            <div className="mx-auto grid w-full">
              <div className="grid gap-8 text-center">
                <h1 className="text-xl font-bold">{loading ? "Estamos conectando sua conta... aguarde." : "Redirecionando"}</h1>
                <div className="flex">
                  <Loader2 className="animate-spin mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
