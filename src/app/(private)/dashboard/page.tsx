"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { CardAdComponent } from "@/components/business/cards/card-creative.component";
import { FloatingVideoCard } from "@/components/business/cards/card-video-floating";
import { FilterBarComponent } from "@/components/business/filter/filter-bar.component";
import { SelectGeneric } from "@/components/business/filter/select-demo";
import { DatePickerWithRange } from "@/components/ui/custom/date-picker-range";
import { useAuth } from "@/context/auth.context";
import FacebookAdsService from "@/service/graph-api.service";
import {
  CreativeGroup,
  groupAdsByCreative,
  sortGroupsByPurchases,
} from "@/utils/creative.util";
import { Loader2 } from "lucide-react";
import SnapshotService from "@/service/snapshot.service";

export default function DashboardPage() {
  const { activeAdAccount, loginWithFacebook } = useAuth();
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 1, 15),
    to: new Date(2025, 1, 16),
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ESTADOS PARA CONTROLAR O VÍDEO SELECIONADO
  const [openVideoCard, setOpenVideoCard] = useState<boolean>(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | undefined>();
  const [selectedVideoPoster, setSelectedVideoPoster] = useState<string | undefined>();
  const [selectedAdTitle, setSelectedAdTitle] = useState<string>("");

  useEffect(() => {
    if (activeAdAccount && dateRange?.from && dateRange.to) {
      fetchData(dateRange);
    }
  }, [activeAdAccount]);

  async function onDateRangeApply(newRange: DateRange | undefined) {
    setDateRange(newRange);
    if (newRange && activeAdAccount) {
      await fetchData(newRange);
    }
  }

  /**
   * Busca o 'source' do vídeo na Graph API
   * e, ao obter, abre o card flutuante com handleOpenVideoCard.
   */
  async function searchVideoCreative(videoId: string, posterUrl?: string, adTitle?: string) {
    try {
      const response = await FacebookAdsService.getVideoCreative(videoId);
      // Supondo que a resposta seja algo como { source: "https://..." }
      if (response?.source) {
        handleOpenVideoCard(response.source, posterUrl, adTitle);
      }
    } catch (err) {
      console.error("Erro ao buscar o vídeo do criativo:", err);
    }
  }

  async function fetchData(range: DateRange) {
    try {
      setIsLoading(true);
      const { from, to } = range;
      if (!from || !to || !activeAdAccount) return;

      const since = format(from, "yyyy-MM-dd");
      const until = format(to, "yyyy-MM-dd");

      // 1. Busca insights para obter IDs de anúncios
      const insights = await FacebookAdsService.getAdInsights(
        activeAdAccount.id, 
        since, 
        until
      );
      const adIds = insights.data.map((item) => item.ad_id);
      if (adIds.length === 0) {
        setGroupedData([]);
        return;
      }

      // 2. Busca anúncios filtrados
      const filteredAds = await FacebookAdsService.getFilteredAds(
        activeAdAccount.id, 
        adIds, 
        since, 
        until
      );
      const adsDesorganizados = filteredAds.data;

      // 3. Agrupa e ordena
      const grouped = groupAdsByCreative(adsDesorganizados);
      const sortedGroups = sortGroupsByPurchases(grouped);
      setGroupedData(sortedGroups);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Exibe o Sheet com o vídeo
   */
  function handleOpenVideoCard(videoUrl?: string, posterUrl?: string, title?: string) {
    if (videoUrl) {
      setSelectedVideoUrl(videoUrl);
      setSelectedVideoPoster(posterUrl);
      setSelectedAdTitle(title || "Anúncio");
      setOpenVideoCard(true);
    }
  }

  return (
    <div className="w-full h-full max-w-screen-xl mx-auto flex flex-col justify-around gap-6 mt-6 mb-6">
      <div className="flex my-auto">
        <img src="fire.gif" alt="" className="w-10" />
        <h1 className="text-3xl font-bold text-center my-auto">Top Criativos</h1>
        {/* <button onClick={loginWithFacebook}>
          Entrar com Facebook
        </button> */}
        <button
          onClick={async () => {
            if (!groupedData) return;
            const slug = await SnapshotService.createSnapshot(groupedData);
            if (slug) {
              // Monta a URL pública, por ex.:
              const publicUrl = `${window.location.origin}/snapshot/${slug}`;
              alert(`Link público criado: ${publicUrl}`);
              // Ou redireciona para lá, ou copia para a área de transferência, etc.
            }
          }}
        >
          Criar Link Publico
        </button>
      </div>

      <FilterBarComponent>
        <SelectGeneric
          label="Agrupar por"
          placeholder="Agrupar por"
          items={[{ value: "criativo", label: "Criativos" }]}
          className="w-[140px]"
        />
        <DatePickerWithRange value={dateRange} onChange={onDateRangeApply} />
      </FilterBarComponent>

      <div className="max-w-[100%] h-full flex">
        {isLoading ? (
          <div className="m-auto h-full my-auto flex items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : groupedData && groupedData.length > 0 ? (
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
                        value: `${group.aggregatedInsights.ctr.toFixed(2)}%`,
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


      {/* COMPONENTE FLOTANTE NO CANTO INFERIOR DIREITO */}
      <FloatingVideoCard
        open={openVideoCard}
        onOpenChange={setOpenVideoCard}
        title={selectedAdTitle}
        videoSource={selectedVideoUrl}
        posterUrl={selectedVideoPoster}
      />
    </div>
  );
}
