"use client";

import { CardAdComponent } from "@/components/business/cards/card-creative.component";
import { FloatingVideoCard } from "@/components/business/cards/card-video-floating";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FacebookAdsService from "@/service/graph-api.service";
import SnapshotService from "@/service/snapshot.service";
import { SnapshotResponse } from "@/types/model/snapshot.model";
import { CreativeGroup } from "@/utils/creative.util";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SnapshotPage() {
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);
  const { slug } = useParams(); 
  const [snapshotData, setSnapshotData] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Estados do vídeo flutuante
  const [openVideoCard, setOpenVideoCard] = useState<boolean>(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | undefined>();
  const [selectedVideoPoster, setSelectedVideoPoster] = useState<string | undefined>();
  const [selectedAdTitle, setSelectedAdTitle] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    async function fetchSnapshot() {
      try {
        const snapshot = await SnapshotService.findSnapshot(slug as string);
        setSnapshotData(snapshot);
        console.log(snapshot);
        const groupedsCreatives = JSON.parse(snapshot.data);
        setGroupedData(groupedsCreatives);
      } catch (err) {
        console.error("Erro ao buscar snapshot:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSnapshot();
  }, [slug]);

  function handleOpenVideoCard(videoUrl?: string, posterUrl?: string, title?: string) {
    if (videoUrl) {
      setSelectedVideoUrl(videoUrl);
      setSelectedVideoPoster(posterUrl);
      setSelectedAdTitle(title || "Anúncio");
      setOpenVideoCard(true);
    }
  }

  async function searchVideoCreative(videoId: string, posterUrl?: string, adTitle?: string) {
    console.log(posterUrl)
    try {
      const response = await FacebookAdsService.getVideoCreative(videoId);
      if (response?.source) {
        handleOpenVideoCard(response.source, posterUrl, adTitle);
      }
    } catch (err) {
      console.error("Erro ao buscar o vídeo do criativo:", err);
    }
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  // Envolvemos o <header> e o <div> em um React Fragment (<> </>) para corrigir o HTML
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                {/* Ajuste esta linha se tiver uma variável activeAdAccount */}
                <BreadcrumbLink href="#">Conta  de Anúncios</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Top Criativos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="w-full h-full max-w-screen-xl mx-auto flex flex-col justify-around gap-6 mt-6 mb-6">

          <div className="flex flex-col my-auto w-full gap-4">
            <div className="justify-between flex">
              <h1 className="text-3xl font-bold text-center my-auto">Snapshot - Top Criativos</h1>
              <span>{ snapshotData?.since }  { snapshotData?.until }</span>
            </div>

            <div className="bg-slate-500 p-4 flex w-full rounded-md">
              <p>{ snapshotData?.comment }</p>
            </div>
          </div>

          <div className="max-w-[100%] h-full flex">
            {groupedData && groupedData.length > 0 ? (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedData.map((group) => {
                  const firstAd = group.ads[0];
                  const creative = group.creative;
                  const poster = creative.object_story_spec?.video_data?.image_url;
                  const title = firstAd.name || creative.id;

                  return (
                    <div key={creative.id}>
                      <CardAdComponent
                        title={title}
                        imageUrl={poster || "/teste.png"}
                        metrics={[
                          {
                            label: "Compras",
                            value: group.aggregatedInsights.actions.purchase ?? 0,
                          },
                          {
                            label: "Gasto Total",
                            value: group.aggregatedInsights.spend.toFixed(2),
                          },
                          {
                            label: "CTR",
                            value: `${group.aggregatedInsights.ctr?.toFixed(2)}%`,
                          },
                          {
                            label: "Tumbstop",
                            value: `${group.aggregatedInsights.tumbstock.toFixed(2)}%`,
                          },
                          {
                            label: "Click to purchase",
                            value: `${group.aggregatedInsights.clickToPurchase.toFixed(2)}%`,
                          },
                          {
                            label: "Custo por LP view",
                            value: `R$${group.aggregatedInsights.costPerLandingPageView.toFixed(2)}`,
                          },
                        ]}
                        onCardClick={() => {
                          const videoId = creative.object_story_spec?.video_data?.video_id;
                          if (videoId) {
                            searchVideoCreative(videoId, poster, title);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="m-auto h-full my-auto flex items-center">
                Nenhum dado encontrado
              </div>
            )}
          </div>

          {/* Card flutuante de vídeo */}
          <FloatingVideoCard
            open={openVideoCard}
            onOpenChange={setOpenVideoCard}
            title={selectedAdTitle}
            videoSource={selectedVideoUrl}
            posterUrl={selectedVideoPoster}
          />
        </div>
      </div>
    </>
  );
}
