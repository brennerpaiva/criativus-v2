"use client";

import { Button } from "@/components/ui/button";
import { useFacebookSdk } from "@/hooks/use-facebook-sdk";
import AuthService from "@/service/auth.service";
import { useCallback, useState } from "react";
const FB_SCOPES =
  "public_profile,email,business_management,pages_show_list"; // ajuste se precisar

export default function OnboardingPage() {
  const sdkReady = useFacebookSdk(
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? ""
  );
   const authService = new AuthService();

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loginWithFacebook = useCallback(() => {
    if (!sdkReady || !window.FB) return;

    setStatus("loading");
    window.FB.login(
      (response: fb.StatusResponse) => {
        if (response.status === "connected") {
          console.log(response);
          const { code } = response.authResponse as { code: string };
          exportCode(code);
        } else {
          setErrorMsg("Não foi possível conectar. Tente novamente.");
          setStatus("error");
        }
      },
      {
        scope: FB_SCOPES,
        // display: "popup", 
        response_type: 'code',
        config_id: '1051990639735066', 
        // return_scopes: true,
      }
    );
  }, [sdkReady]);

  const exportCode = async (code: string) => {
    try {
      await authService.createTokenFacebook(code);
      setStatus("success");
    } catch (error) {
      console.error("Erro atoken", error);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-2xl font-bold">
              Conecte sua conta de anúncios Meta
            </h1>
            <p className="text-muted-foreground">
              Conecte sua conta de anúncios para acessar seus criativos.
            </p>

            <Button
              onClick={loginWithFacebook}
              disabled={!sdkReady || status === "loading"}
            >
              {status === "loading" ? "Conectando..." : "Conectar com Facebook"}
            </Button>

            {status === "success" && (
              <p className="text-sm text-green-600">
                ✅ Usuário conectado com sucesso
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600">⚠️ {errorMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
