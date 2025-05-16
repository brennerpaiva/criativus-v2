"use client";

import { SignInFormComponent } from "@/components/business/forms/sign-in-form.component";
import Image from "next/image";
import { useEffect, useState } from "react";
import ImageBanner from '/public/teste.jpg';

export default function SignInPage() {
  const [adAccounts, setAdAccounts] = useState([]);

  useEffect(() => {
    async function fetchAdAccounts() {
      // try {
      //   const accounts = await FacebookAdsService.getAdAccounts();
      //   // setAdAccounts(accounts);
      // } catch (error) {
      //   console.error("Erro ao buscar contas de anúncios:", error);
      // }
    }

    fetchAdAccounts();
  }, []);
  
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Entrar</h1>
            <p className="text-balance text-muted-foreground">
             Faça login com sua conta.
            </p>
          </div>
          <SignInFormComponent />
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <a href="/sign-up" className="underline">
              Crie sua conta
            </a>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src={ImageBanner}
          alt="Image"
          width="1920"
          height="1080"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
