"use client";

import { CardAdComponent } from "@/components/business/cards/card-creative.component";
import { FloatingVideoCard } from "@/components/business/cards/card-video-floating";
import { FilterBarComponent } from "@/components/business/filter/filter-bar.component";
import { SelectGeneric } from "@/components/business/filter/select-demo";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/custom/date-picker-range";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // <-- Import Popover do shadcn/ui
import { Textarea } from "@/components/ui/textarea"; // <-- Import do Textarea do shadcn/ui

import { useAuth } from "@/context/auth.context";
import FacebookAdsService from "@/service/graph-api.service";
import SnapshotService from "@/service/snapshot.service";
import {
  CreativeGroup,
  groupAdsByCreative,
  sortGroupsByPurchases,
} from "@/utils/creative.util";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function TopCriativosVendasPage() {
  const router = useRouter();
  const { activeAdAccount } = useAuth();
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 1, 15),
    to: new Date(2025, 1, 16),
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados do popover de "Criar Snapshot"
  const [openSnapshotPopover, setOpenSnapshotPopover] = useState(false);
  const [comment, setComment] = useState("");

  // ESTADOS PARA CONTROLAR O VÍDEO SELECIONADO
  const [openVideoCard, setOpenVideoCard] = useState<boolean>(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | undefined>();
  const [selectedVideoPoster, setSelectedVideoPoster] = useState<string | undefined>();
  const [selectedAdTitle, setSelectedAdTitle] = useState<string>("");

  useEffect(() => {
    if (activeAdAccount && dateRange?.from && dateRange?.to) {
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

  /**
   * Lida com o clique para abrir o popover de criar snapshot.
   * Só abrimos o popover se houver dados carregados (groupedData).
   */
  function handleOpenSnapshotPopover() {
    if (!groupedData || groupedData.length === 0) return;
    setOpenSnapshotPopover(true);
  }

  /**
   * Envia o snapshot para o backend quando o usuário clica em "Gerar link"
   */
  async function handleGenerateSnapshotLink() {
    if (!groupedData || !dateRange?.from || !dateRange?.to) return;

    try {
      setIsLoading(true);

      const since = format(dateRange.from, "yyyy-MM-dd");
      const until = format(dateRange.to, "yyyy-MM-dd");

      // Aqui enviamos `comment`, `groupedData`, `since` e `until` para o back-end
      const snapshotBody = {
        groupedData,
        comment,
        since,
        until,
      }
      const response = await SnapshotService.createSnapshot(snapshotBody);

      // Fechamos o popover e limpamos o comentário
      setOpenSnapshotPopover(false);
      setComment("");

      // Redireciona para a página do snapshot se tudo der certo
      if (response && response.slug) {
        router.push(`/snapshot/${response.slug}`);
      }
    } catch (error) {
      console.error("Erro ao criar snapshot:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full h-full max-w-screen-xl mx-auto flex flex-col justify-around gap-6 mt-6 mb-6">
      <div className="flex my-auto justify-between">
        <div className="flex">
          <img src="fire.gif" alt="" className="w-10" />
          <h1 className="text-3xl font-bold text-center my-auto">Top Criativos</h1>
        </div>

        {/* POPUP DE CRIAR SNAPSHOT */}
        <Popover open={openSnapshotPopover} onOpenChange={setOpenSnapshotPopover}>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading || !groupedData || groupedData.length === 0}
              onClick={handleOpenSnapshotPopover}
            >
              Criar Snapshot
            </Button>
          </PopoverTrigger>

          <PopoverContent side="bottom" align="end" className="w-64 p-4 flex flex-col space-y-4">
            <span className="font-semibold text-sm">Adicionar comentário</span>
            <Textarea
              placeholder="Digite aqui..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button
              onClick={handleGenerateSnapshotLink}
              disabled={isLoading || !comment}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Gerar link
            </Button>
          </PopoverContent>
        </Popover>
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
          <div className="grid sm:grid-cols-1 mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedData.map((group) => {
              const firstAd = group.ads[0];
              const creative = group.creative;
              const poster = creative.object_story_spec?.video_data?.image_url;
              const title = firstAd.name || creative.id;

              return (
                <div key={creative.id}>
                  <CardAdComponent
                    title={title}
                    imageUrl={poster || "/teste.jpg"}
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

      {/* COMPONENTE FLUTUANTE NO CANTO INFERIOR DIREITO */}
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
