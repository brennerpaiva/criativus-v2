"use client";

import { LoginFormComponent } from "@/components/business/forms/login-form.component";
import FacebookAdsService from "@/service/graph-api.service";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [adAccounts, setAdAccounts] = useState([]);

  useEffect(() => {
    async function fetchAdAccounts() {
      try {
        const accounts = await FacebookAdsService.getAdAccounts();
        console.log("Ad Accounts:", accounts);
        setAdAccounts(accounts);
      } catch (error) {
        console.error("Erro ao buscar contas de anúncios:", error);
      }
    }

    fetchAdAccounts();
  }, []);
  
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <LoginFormComponent />
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <a href="/signup" className="underline">
              Crie sua conta
            </a>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/teste.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
