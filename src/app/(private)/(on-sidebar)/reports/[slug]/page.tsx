"use client";

import { CardAdComponent } from "@/components/business/cards/card-creative.component";
import { FloatingVideoCard } from "@/components/business/cards/card-video-floating";
import { FilterBarComponent } from "@/components/business/filter/filter-bar.component";
import { MetricChipsBar } from "@/components/business/filter/metrics-chips-bar.component";
import { SelectGeneric } from "@/components/business/filter/select-demo";
import { Button } from "@/components/ui/button";
import {
  DatePickerWithRange,
  type SimpleRange,
} from "@/components/ui/custom/date-picker-range";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { METRIC_MAP, MetricKey } from "@/constants/metric";

import { useAuth } from "@/context/auth.context";
import FacebookAdsService from "@/service/graph-api.service";
import ReportService from "@/service/report.service";
import SnapshotService from "@/service/snapshot.service";
import { usePageConfigStore } from "@/store/report/collection.store";
import {
  CreativeGroup,
  groupAdsByCreative,
  sortGroupsByMetric,
} from "@/utils/creative.util";
import {
  format,
  isValid,
  parse,
} from "date-fns";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const parseYMD = (s?: string | null) =>
  s ? parse(s, "yyyy-MM-dd", new Date()) : undefined;

const ensureDateObjects = (r?: SimpleRange) => {
  const from = parseYMD(r?.from);
  const to   = parseYMD(r?.to);
  return from && to && isValid(from) && isValid(to) ? { from, to } : undefined;
};

const buildDefaultDateRange = (): SimpleRange => {
  const today = new Date();
  const seven = new Date();
  seven.setDate(today.getDate() - 6);
  return {
    from: format(seven, "yyyy-MM-dd"),
    to:   format(today, "yyyy-MM-dd"),
  };
};

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */
const DEFAULT_FILTERS = {
  metricsOrder: ["tumbstock", "ctrLinkClick"] as MetricKey[],
  sorted: "tumbstock" as MetricKey,
  dateRange: buildDefaultDateRange(),
};

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function CustomPage() {
  const router = useRouter();
  const { activeAdAccount } = useAuth();
  const { slug } = useParams<{ slug: string }>();

  /* store */
  const setCurrentPageConfig = usePageConfigStore(
    (s) => s.setCurrentPageConfig,
  );
  const updateListFilters = usePageConfigStore((s) => s.updateListFilters);
  const currentPageConfig = usePageConfigStore((s) => s.currentPageConfig);

  /* filtros */
  const listFilters = currentPageConfig?.listFilters ?? DEFAULT_FILTERS;
  const metricsOrder = listFilters.metricsOrder ?? [];
  const sorted = listFilters.sorted ?? "tumbstock";
  const dateRange = useMemo(
    () => listFilters.dateRange ?? DEFAULT_FILTERS.dateRange,
    [listFilters.dateRange],
  );

  /* estados */
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSnapshotPopover, setOpenSnapshotPopover] = useState(false);
  const [comment, setComment] = useState("");
  const [openVideoCard, setOpenVideoCard] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>();
  const [selectedVideoPoster, setSelectedVideoPoster] = useState<string>();
  const [selectedAdTitle, setSelectedAdTitle] = useState<string>("");
  const [notFoundPage, setNotFoundPage] = useState<boolean>(false);

  /* ------------------------------------------------------------------
   * efeitos
   * ----------------------------------------------------------------*/
  /* carrega config do relatório */
  useEffect(() => {
    (async () => {
      try {
        const resp = await ReportService.findBySlug(slug);
        setCurrentPageConfig({
          listFilters: {
            metricsOrder: resp.metricsOrder ?? DEFAULT_FILTERS.metricsOrder,
            sorted: (resp.sorted as MetricKey) ?? DEFAULT_FILTERS.sorted,
            dateRange:
              resp.dateStart
                ? { from: resp.dateStart, to: resp.dateEnd }
                : DEFAULT_FILTERS.dateRange,
          },
          name: resp.name,
          description: resp.description ?? "",
          icon: "",
          slug: resp.slug,
          id: resp.id.toString(),
        });
        setNotFoundPage(false);
      } catch (err) {
        setNotFoundPage(true);
        console.error(err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* busca dados quando troca conta */
  useEffect(() => {
    const dates = ensureDateObjects(dateRange);
    if (activeAdAccount && dates) fetchData(dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAdAccount]);

  /* ------------------------------------------------------------------
   * handlers
   * ----------------------------------------------------------------*/
  async function onDateRangeApply(newRange: SimpleRange | undefined) {
    if (!newRange) return;
    
    // If only one date is selected, use it for both from and to
    if (newRange.from && !newRange.to) {
      newRange.to = newRange.from;
    } else if (!newRange.from && newRange.to) {
      newRange.from = newRange.to;
    }
    
    updateListFilters({ dateRange: newRange });
    const dates = ensureDateObjects(newRange);
    if (dates && activeAdAccount) await fetchData(dates);
  }

  async function searchVideoCreative(
    videoId: string,
    posterUrl?: string,
    adTitle?: string,
  ) {
    try {
      const res = await FacebookAdsService.getVideoCreative(videoId);
      if (res?.source) handleOpenVideoCard(res.source, posterUrl, adTitle);
    } catch (err) {
      console.error("Erro ao buscar vídeo:", err);
    }
  }

  async function fetchData(range: { from: Date; to: Date }) {
    if (!isValid(range.from) || !isValid(range.to)) return; // ← evita RangeError
    try {
      setIsLoading(true);
      const since = format(range.from, "yyyy-MM-dd");
      const until = format(range.to,   "yyyy-MM-dd");

      const insights = await FacebookAdsService.getAdInsights(
        activeAdAccount!.id,
        since,
        until,
      );
      const adIds = insights.data.map((i) => i.ad_id);
      if (!adIds.length) return setGroupedData([]);

      const filteredAds = await FacebookAdsService.getFilteredAds(
        activeAdAccount!.id,
        adIds,
        since,
        until,
      );

      const grouped = groupAdsByCreative(filteredAds.data);
      setGroupedData(sortGroupsByMetric(grouped, sorted));
    } finally {
      setIsLoading(false);
    }
  }

  /* reordena quando sorted muda */
  useEffect(() => {
    if (!groupedData) return;
    setGroupedData((prev) =>
      prev
        ? sortGroupsByMetric(
            Object.fromEntries(prev.map((g) => [g.creative.id, g])),
            sorted,
          )
        : prev,
    );
  }, [sorted]);

  /* mantém sorted válido */
  useEffect(() => {
    if (metricsOrder.length && !metricsOrder.includes(sorted)) {
      updateListFilters({ sorted: metricsOrder[0] });
    }
  }, [metricsOrder, sorted]);

  /* UI helpers */
  function handleOpenVideoCard(
    videoUrl?: string,
    posterUrl?: string,
    title?: string,
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
    const dates = ensureDateObjects(dateRange);
    if (!groupedData || !dates) return;
    try {
      setIsLoading(true);
      const body = {
        groupedData,
        comment,
        since: format(dates.from, "yyyy-MM-dd"),
        until: format(dates.to,   "yyyy-MM-dd"),
      };
      const res = await SnapshotService.createSnapshot(body);
      setOpenSnapshotPopover(false);
      setComment("");
      if (res?.slug) router.push(`/snapshot/${res.slug}`);
    } catch (err) {
      console.error("Erro ao criar snapshot:", err);
    } finally {
      setIsLoading(false);
    }
  }


  /* ------------------------------------------------------------------ */
  /* render                                                             */
  /* ------------------------------------------------------------------ */
  if (notFoundPage) {
    return (
      <div className="w-full h-full max-w-screen-xl mx-auto flex flex-col items-center justify-center gap-6 mt-6 mb-6">
        <h1 className="text-3xl font-bold">Relatório não encontrado</h1>
        <p className="text-muted-foreground">O relatório que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => router.push('/top-criativos-vendas')}>
          Voltar para relatórios
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-screen-xl mx-auto flex flex-col gap-6 mt-6 mb-6">
      {/* título + snapshot */}
      <div className="flex justify-between">
        <div className="flex gap-2 flex-col">
          <h1 className="text-3xl font-bold">
            {currentPageConfig?.name ?? ""}
          </h1>
          <p>{currentPageConfig?.description ?? ""}</p>
        </div>

        <Popover
          open={openSnapshotPopover}
          onOpenChange={setOpenSnapshotPopover}
        >
          <PopoverTrigger asChild>
            <Button
              disabled={true}
              onClick={handleOpenSnapshotPopover}
            >
              Criar Snapshot
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            className="w-64 p-4 flex flex-col space-y-4"
          >
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
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Gerar link
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* filtros (data + métrica) */}
      <div className="flex w-full gap-2">
        <DatePickerWithRange value={dateRange} onChange={onDateRangeApply} />
        <SelectGeneric
          label="Ordenar por"
          icon={<ArrowDownUp className="h-4 w-4" />}
          placeholder="Métrica"
          value={sorted}
          items={metricsOrder.map((m) => ({
            value: m,
            label: METRIC_MAP[m].label,
          }))}
          onValueChange={(val) =>
            updateListFilters({ sorted: val as MetricKey })
          }
          className="w-[200px]"
        />
      </div>

      {/* chips de métricas */}
      <FilterBarComponent>
        <MetricChipsBar
          value={metricsOrder}
          onChange={(order) =>
            updateListFilters({ metricsOrder: order })
          }
          maxItems={6}
          minItems={1}
        />
      </FilterBarComponent>

      {/* cards */}
      <div className="flex-1">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : !groupedData?.length ? (
          <div className="h-full flex items-center justify-center">
            Nenhum dado encontrado
          </div>
        ) : (
          <div className="grid mx-auto gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groupedData.map((group) => {
              const creative = group.creative;
              const poster =
                creative.object_story_spec?.video_data?.image_url ||
                creative.image_url ||
                creative.thumbnail_url;
              const mediaType =
                creative.object_story_spec?.video_data?.image_url
                  ? "VIDEO"
                  : "IMAGE";
              const title = group.ads[0]?.name || creative.id;

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
                    const videoId =
                      creative.object_story_spec?.video_data?.video_id;
                    if (videoId)
                      searchVideoCreative(videoId, poster, title);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* vídeo flutuante */}
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
