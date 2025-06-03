'use client';

import { useEffect, useState } from 'react';

/**
 * Carrega o Facebook SDK em runtime e devolve `true` quando estiver pronto.
 */
export function useFacebookSdk(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Caso o script já tenha sido carregado anteriormente
    if (typeof window !== 'undefined' && (window as any).FB) {
      setReady(true);
      return;
    }

    // Callback global exigido pelo SDK
    (window as any).fbAsyncInit = () => {
      (window as any).FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v18.0',
      });
      setReady(true);
    };

    // Injeta o script <script id="facebook-jssdk" …>
    (function loadSdk(d: Document, s: string, id: string) {
      if (d.getElementById(id)) return;
      const js = d.createElement(s);
      js.id = id;
      (js as HTMLScriptElement).src = 'https://connect.facebook.net/en_US/sdk.js';
      const ref = d.getElementsByTagName(s)[0];
      ref.parentNode!.insertBefore(js, ref);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  return ready;
}
