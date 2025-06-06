// hooks/use-facebook-sdk.ts
"use client";
import { useEffect, useState } from "react";

export function useFacebookSdk(appId: string) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // se já carregou em outra página
    if (typeof window !== "undefined" && window.FB) {
      setReady(true);
      return;
    }

    // callback global que o SDK invoca quando terminar de baixar
    (window as any).fbAsyncInit = () => {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v18.0",
      });
      setReady(true);
    };

    // injeta o script
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    document.body.appendChild(script);
  }, [appId]);

  return ready;
}
