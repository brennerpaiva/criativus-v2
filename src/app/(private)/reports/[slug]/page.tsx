"use client";

import { CardAdComponent } from "@/components/business/cards/card-creative.component";
import { FloatingVideoCard } from "@/components/business/cards/card-video-floating";
import { FilterBarComponent } from "@/components/business/filter/filter-bar.component";
import { MetricChipsBar } from "@/components/business/filter/metrics-chips-bar.component";
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
import ReportService from "@/service/report.service";
import SnapshotService from "@/service/snapshot.service";
import {
  CreativeGroup,
  groupAdsByCreative,
  sortGroupsByPurchases,
} from "@/utils/creative.util";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/number-format";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

/* --------------------------------------------------
 * Métricas disponíveis e mapeamento dos campos do
 * aggregatedInsights + diff ➜ componente Card.
 * -------------------------------------------------*/
const METRIC_MAP = {
  /* ---------- já existentes ---------- */
  tumbstock: {
    label: "Thumb-stop",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) =>
      formatPercent(i.tumbstock),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.tumbstock),
  },
  ctrLinkClick: {
    label: "CTR (link click)",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.ctrLinkClick),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.ctrLinkClick),
  },
  cpcLinkClick: {
    label: "CPC",
    invert: true,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatCurrency(i.cpcLinkClick),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.cpcLinkClick),
  },
  cpm: {
    label: "CPM",
    invert: true,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatCurrency(i.cpm),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.cpm),
  },
  clickToPurchase: {
    label: "Click to Purchase",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.clickToPurchase),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.clickToPurchase),
  },
  costSitePurchase: {
    label: "Custo por Compra",
    invert: true,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatCurrency(i.costSitePurchase),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.costSitePurchase),
  },
  purchase: {
    label: "Compras",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatNumber(i.actions.purchase || 0),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.purchase),
  },
  roasCustom: {
    label: "ROAS",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) =>
      formatNumber(i.roasCustom, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.roasCustom),
  },
  spend: {
    label: "Gasto (Spend)",
    invert: true,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatCurrency(i.spend),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.spend),
  },
  impressions: {
    label: "Impressões",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatNumber(i.impressions),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.impressions),
  },
  clicks: {
    label: "Cliques",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatNumber(i.clicks),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.clicks),
  },
  ctr: {
    label: "CTR",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.ctr),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.ctr),
  },
  costPerLandingPageView: {
    label: "Cost per Landing Page View",
    invert: true,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatCurrency(i.costPerLandingPageView),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.costPerLandingPageView),
  },
  siteArrivalRate: {
    label: "Taxa de chegada ao site",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.siteArrivalRate),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.siteArrivalRate),
  },
  landingPageViews: {
    label: "Landing Page Views",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatNumber(i.landingPageViews),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.landingPageViews),
  },
  purchaseRoas: {
    label: "Purchase ROAS",
    invert: false,
    value: (i: CreativeGroup["aggregatedInsights"]) => formatNumber(i.purchaseRoas, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    diff:  (i: CreativeGroup["aggregatedInsights"]) => formatPercent(i.diff.purchaseRoas),
  },
} as const;


type MetricKey = keyof typeof METRIC_MAP;

export default function CustomPage() {
  const router = useRouter();
  const { activeAdAccount } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [report, setReport] = useState<Awaited<ReturnType<typeof ReportService.findBySlug>> | null>(null);

  /* ---------------- filtros de período -------------- */
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    return { from: sevenDaysAgo, to: today } as DateRange;
  });

  /* ---------------- estados principais -------------- */
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metricsOrder, setMetricsOrder] = useState<MetricKey[]>([
    "tumbstock",
    "ctrLinkClick",
  ]);

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
        const resp = await ReportService.findBySlug(slug);
        setReport(resp);
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
    setDateRange(newRange);
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
      setGroupedData(sortGroupsByPurchases(grouped));
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }

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
            {report ? report.name : ""}
          </h1>
          <p> {report ? report.description : ""}</p>
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

      {/* ---------- filtros ---------- */}
        {/* <SelectGeneric
          label="Agrupar por"
          placeholder="Agrupar por"
          defaultValue="criativo"
          items={[{ value: "criativo", label: "Criativos" }]}
          className="w-[140px]"
        /> */}
        <DatePickerWithRange value={dateRange} onChange={onDateRangeApply} />
      <FilterBarComponent>
        <MetricChipsBar
          value={metricsOrder}
          onChange={setMetricsOrder}
          maxItems={6}
          minItems={0}
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

