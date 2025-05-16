"use client";

import { CardAdComponent } from "@/components/business/cards/card-creative.component";
import { FloatingVideoCard } from "@/components/business/cards/card-video-floating";
import { FilterBarComponent } from "@/components/business/filter/filter-bar.component";
import { MetricChipsBar } from "@/components/business/filter/metrics-chips-bar.component";
import { SelectGeneric } from "@/components/business/filter/select-demo";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/custom/date-picker-range";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // <-- Import Popover do shadcn/ui
import { Textarea } from "@/components/ui/textarea"; // <-- Import do Textarea do shadcn/ui
import { METRIC_MAP, MetricKey } from "@/constants/metric";

import { useAuth } from "@/context/auth.context";
import FacebookAdsService from "@/service/graph-api.service";
import SnapshotService from "@/service/snapshot.service";
import { usePageConfigStore } from "@/store/report/collection.store";
import {
  CreativeGroup,
  groupAdsByCreative,
  sortGroupsByMetric
} from "@/utils/creative.util";
import { format } from "date-fns";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

const ensureDateObjects = (r?: DateRange): DateRange | undefined =>
  r
    ? {
        from: r.from && !(r.from instanceof Date) ? new Date(r.from) : r.from,
        to: r.to && !(r.to instanceof Date) ? new Date(r.to) : r.to,
      }
    : undefined;

const buildDefaultDateRange = (): DateRange => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    return { from: sevenDaysAgo, to: today } as DateRange;
};

const DEFAULT_FILTERS = {
  metricsOrder: ["tumbstock", "ctrLinkClick"] as MetricKey[],
  sorted: "tumbstock" as MetricKey,
  dateRange: buildDefaultDateRange(),
};

export default function CustomPage() {
  const router = useRouter();
  const { activeAdAccount } = useAuth();
  const { slug } = useParams<{ slug: string }>();
 
  const setCurrentPageConfig = usePageConfigStore(
    (s) => s.setCurrentPageConfig,
  );
  const updateListFilters = usePageConfigStore((s) => s.updateListFilters);
  const currentPageConfig = usePageConfigStore((s) => s.currentPageConfig);

  /* ---------------- filtros de período -------------- */
  const listFilters = currentPageConfig?.listFilters ?? DEFAULT_FILTERS;
  const metricsOrder = listFilters.metricsOrder ?? [];
  const sorted = listFilters.sorted ?? "tumbstock";
  const dateRange = useMemo(
    () =>
      ensureDateObjects(listFilters.dateRange) ?? DEFAULT_FILTERS.dateRange,
    [listFilters.dateRange],
  );
  /* ---------------- estados principais -------------- */
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderMetric, setOrderMetric] = useState<MetricKey>("tumbstock");

  /* ---------------- snapshot ------------------------ */
  const [openSnapshotPopover, setOpenSnapshotPopover] = useState(false);
  const [comment, setComment] = useState("");

  /* ---------------- vídeo flutuante ---------------- */
  const [openVideoCard, setOpenVideoCard] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>();
  const [selectedVideoPoster, setSelectedVideoPoster] = useState<string>();
  const [selectedAdTitle, setSelectedAdTitle] = useState<string>("");

  /* -------------- efeitos -------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setCurrentPageConfig({
          listFilters: {
            metricsOrder: DEFAULT_FILTERS.metricsOrder,
            sorted: DEFAULT_FILTERS.sorted,
            dateRange: DEFAULT_FILTERS.dateRange,
          },
          name: 'Top Criativos - Vendas',
          description: "",
          icon: "",
          slug: undefined,
          id: undefined,
        });
      } catch (err) {
        console.error(err);
        // router.push("/404"); // redireciona se 404 ou 403
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);


  useEffect(() => {


    if (activeAdAccount && dateRange?.from && dateRange?.to) {
      fetchData(dateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAdAccount]);


  async function onDateRangeApply(newRange: DateRange | undefined) {
    if(!newRange){return}
    // setDateRange(newRange);
    updateListFilters({ dateRange: newRange });
    if (newRange && activeAdAccount) await fetchData(newRange);
  }

  /* -------------- busca fonte do vídeo -------------- */
  async function searchVideoCreative(
    videoId: string,
    posterUrl?: string,
    adTitle?: string
  ) {
    try {
      const res = await FacebookAdsService.getVideoCreative(videoId);
      if (res?.source) handleOpenVideoCard(res.source, posterUrl, adTitle);
    } catch (err) {
      console.error("Erro ao buscar vídeo:", err);
    }
  }

  /* -------------- fetch de dados principais --------- */
  async function fetchData(range: DateRange) {
    try {
      setIsLoading(true);
      const { from, to } = range;
      if (!from || !to || !activeAdAccount) return;

      const since = format(from, "yyyy-MM-dd");
      const until = format(to, "yyyy-MM-dd");

      const insights = await FacebookAdsService.getAdInsights(
        activeAdAccount.id,
        since,
        until
      );
      const adIds = insights.data.map((i) => i.ad_id);
      if (!adIds.length) return setGroupedData([]);

      const filteredAds = await FacebookAdsService.getFilteredAds(
        activeAdAccount.id,
        adIds,
        since,
        until
      );

      const grouped = groupAdsByCreative(filteredAds.data);
      setGroupedData(sortGroupsByMetric(grouped, sorted));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!groupedData) return;
    setGroupedData((prev) =>
      prev ? sortGroupsByMetric(Object.fromEntries(prev.map(g => [g.creative.id, g])), sorted) : prev
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted]);

  /* mantém orderMetric válido sempre que metricsOrder mudar */
  useEffect(() => {
    // se o item atualmente selecionado deixou de existir…
    if(!metricsOrder) {return}
    if (metricsOrder.length && !metricsOrder.includes(sorted)) {
      updateListFilters({ sorted: metricsOrder[0] });// …seleciona o primeiro
    }
  }, [metricsOrder, sorted]);


  /* -------------- helpers UI ----------------------- */
  function handleOpenVideoCard(
    videoUrl?: string,
    posterUrl?: string,
    title?: string
  ) {
    if (!videoUrl) return;
    setSelectedVideoUrl(videoUrl);
    setSelectedVideoPoster(posterUrl);
    setSelectedAdTitle(title || "Anúncio");
    setOpenVideoCard(true);
  }

  function handleOpenSnapshotPopover() {
    if (!groupedData?.length) return;
    setOpenSnapshotPopover(true);
  }

  async function handleGenerateSnapshotLink() {
    if (!groupedData || !dateRange?.from || !dateRange?.to) return;
    try {
      setIsLoading(true);
      const snapshotBody = {
        groupedData,
        comment,
        since: format(dateRange.from, "yyyy-MM-dd"),
        until: format(dateRange.to, "yyyy-MM-dd"),
      };
      const res = await SnapshotService.createSnapshot(snapshotBody);
      setOpenSnapshotPopover(false);
      setComment("");
      if (res?.slug) router.push(`/snapshot/${res.slug}`);
    } catch (err) {
      console.error("Erro ao criar snapshot:", err);
    } finally {
      setIsLoading(false);
    }
  }

  /* --------------------------------------------------
   * render
   * ------------------------------------------------*/
  return (
    <div className="w-full h-full max-w-screen-xl mx-auto flex flex-col gap-6 mt-6 mb-6">
      {/* ---------- título + snapshot ---------- */}
      <div className="flex justify-between">
        <div className="flex gap-2 flex-col">
          {/* <img src="/fire.gif" alt="fire" className="w-10" /> */}
          <h1 className="text-3xl font-bold my-auto">
            Top criativos - Vendas
          </h1>
          <p> {currentPageConfig ? currentPageConfig.description : ""}</p>
        </div>

        <Popover open={openSnapshotPopover} onOpenChange={setOpenSnapshotPopover}>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading || !groupedData?.length}
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
            <Button onClick={handleGenerateSnapshotLink} disabled={isLoading || !comment}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar link
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex w-full gap-2">
        <DatePickerWithRange value={dateRange} onChange={onDateRangeApply} />
        <SelectGeneric
          label="Ordenar por"
          icon={<ArrowDownUp className="h-4 w-4" />}
          placeholder="Métrica"
          value={sorted}
          items={metricsOrder.map((m) => ({ value: m, label: METRIC_MAP[m].label }))}
          onValueChange={(val) =>
            updateListFilters({ sorted: val as MetricKey })
          }
          className="w-[200px]"
        />
      </div>
        
      <FilterBarComponent>
        <MetricChipsBar
          value={metricsOrder}
          onChange={(order) => updateListFilters({ metricsOrder: order })}
          maxItems={6}
          minItems={1}
        />
      </FilterBarComponent>

      {/* ---------- cards ---------- */}
      <div className="flex-1">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : !groupedData?.length ? (
          <div className="h-full flex items-center justify-center">Nenhum dado encontrado</div>
        ) : (
          <div className="grid mx-auto gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groupedData.map((group) => {
              const creative = group.creative;
              const poster =
                creative.object_story_spec?.video_data?.image_url ||
                creative.image_url ||
                creative.thumbnail_url;
              const mediaType = creative.object_story_spec?.video_data?.image_url ? "VIDEO" : "IMAGE";
              const title = group.ads[0]?.name || creative.id;

              // monta métricas conforme ordem escolhida
              const metrics = metricsOrder.map((id) => {
                const def = METRIC_MAP[id];
                return {
                  label: def.label,
                  value: def.value(group.aggregatedInsights),
                  difference: def.diff(group.aggregatedInsights),
                  invert: def.invert,
                };
              });

              return (
                <CardAdComponent
                  key={creative.id}
                  title={title}
                  thumbUrl={poster || "/placeholder.jpg"}
                  mediaType={mediaType}
                  metrics={metrics}
                  onCardClick={() => {
                    const videoId = creative.object_story_spec?.video_data?.video_id;
                    if (videoId) searchVideoCreative(videoId, poster, title);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- vídeo flutuante ---------- */}
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


