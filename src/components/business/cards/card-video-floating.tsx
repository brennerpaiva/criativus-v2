"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import * as React from "react";

interface FloatingVideoCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  videoSource?: string; // URL do vídeo
  posterUrl?: string;   // Opcional, imagem de poster
}

export function FloatingVideoCard({
  open,
  onOpenChange,
  title,
  videoSource,
  posterUrl,
}: FloatingVideoCardProps) {
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);

  // Sempre que a URL do vídeo mudar, resetamos o estado de "carregado"
  React.useEffect(() => {
    setIsVideoLoaded(false);
  }, [videoSource]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:w-[400px] ml-auto !p-0 !pb-2 flex flex-col"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{title || "Visualização do Vídeo"}</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          {!videoSource ? (
            <p>Nenhum vídeo disponível.</p>
          ) : (
            <>
              {/* Mostrar mensagem ou spinner enquanto carrega */}
              {!isVideoLoaded && (
                <div className="mb-2">Carregando vídeo...</div>
              )}

              <video
                width="100%"
                height="auto"
                controls
                poster={posterUrl}
                className={`rounded-md border transition-opacity duration-300 ${
                  isVideoLoaded ? "opacity-100" : "opacity-0"
                }`}
                onCanPlay={() => setIsVideoLoaded(true)}
              >
                <source src={videoSource} type="video/mp4" />
                Seu navegador não suporta vídeos em HTML5.
              </video>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
