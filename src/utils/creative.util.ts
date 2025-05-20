import { MetricKey } from "@/components/business/filter/metrics-chips-bar.component";
import { METRIC_MAP } from "@/constants/metric";
import { AdCreativeInsight } from "@/types/model/creative-insights.model";

/** Estrutura de um grupo de anúncios por criativo */
export interface CreativeGroup {
  creative: {
    id: string;
    name?: string;
    thumbnail_url?: string;
    image_url?: string;
    object_story_spec?: {
      instagram_user_id: string;
      page_id: string;
      video_data?: {
        video_id: string;
        call_to_action: { type: string; value: { link: string } };
        image_url?: string;
        image_hash?: string;
      };
    };
  };
  ads: AdCreativeInsight[];
  aggregatedInsights: {
    /* métricas absolutas */
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    purchaseRoas: number;
    roasCustom: number;
    actions: Record<string, number>;
    tumbstock: number;
    clickToPurchase: number;
    costPerLandingPageView: number;
    ctrLinkClick: number;
    costSitePurchase: number;
    cpm: number;
    cpcLinkClick: number;
    landingPageViews: number;
    siteArrivalRate: number;

    /* percentuais de diferença em relação à média */
    diff: Record<string, number>;

    /* internos para cálculo */
    _roasCount?: number;
    _purchaseValueSum?: number;
  };
}

/* ---------- funções utilitárias -------------------------------------------------- */

function computeFinalInsights(grouped: Record<string, CreativeGroup>) {
  Object.values(grouped).forEach(group => {
    const i = group.aggregatedInsights;
    const actions = i.actions;
    const linkClicks = actions["link_click"] || 0;
    const videoViews = actions["video_view"] || 0;
    const landingViews = actions["landing_page_view"] || 0;
    const purchaseCount = actions["purchase"] || 0;

    if (i.impressions > 0) {
      i.ctr = (i.clicks / i.impressions) * 100;
      i.ctrLinkClick = (linkClicks / i.impressions) * 100;
      i.tumbstock = (videoViews / i.impressions) * 100;
      i.cpm = (i.spend / i.impressions) * 1000;
    }

    i.cpcLinkClick = linkClicks > 0 ? i.spend / linkClicks : 0;
    i.landingPageViews = landingViews;
    i.costPerLandingPageView = landingViews > 0 ? i.spend / landingViews : 0;
    i.siteArrivalRate = linkClicks > 0 ? (landingViews / linkClicks) * 100 : 0;
    i.clickToPurchase = linkClicks > 0 ? (purchaseCount / linkClicks) * 100 : 0;

    if (i._roasCount! > 0) {
      i.purchaseRoas = i.purchaseRoas / i._roasCount!;
      i.roasCustom = i._purchaseValueSum! / i.spend;
    } else {
      i.purchaseRoas = 0;
      i.roasCustom = 0;
    }

    i.costSitePurchase = purchaseCount > 0 ? i.spend / purchaseCount : 0;
    delete i._roasCount;
    delete i._purchaseValueSum;
  });
}

/* ---------- agrupamento ---------------------------------------------------------- */

export function groupAdsByCreative(
  ads: AdCreativeInsight[]
): Record<string, CreativeGroup> {
  const grouped = ads.reduce((acc, ad) => {
    const key =
      ad.creative.object_story_spec?.video_data?.video_id ||
      ad.creative.image_url ||
      ad.name ||
      ad.creative.id;

    if (!acc[key]) {
      acc[key] = {
        creative: { ...ad.creative },
        ads: [],
        aggregatedInsights: {
          spend: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          purchaseRoas: 0,
          roasCustom: 0,
          actions: {},
          tumbstock: 0,
          clickToPurchase: 0,
          costPerLandingPageView: 0,
          ctrLinkClick: 0,
          costSitePurchase: 0,
          cpm: 0,
          cpcLinkClick: 0,
          landingPageViews: 0,
          siteArrivalRate: 0,
          diff: {},           //  ← inicializa aqui
          _roasCount: 0,
          _purchaseValueSum: 0,
        },
      };
    } else if (
      !acc[key].creative.object_story_spec &&
      ad.creative.object_story_spec
    ) {
      acc[key].creative.object_story_spec = ad.creative.object_story_spec;
    }

    acc[key].ads.push(ad);
    const insight = ad.insights?.data?.[0];
    if (insight) {
      const gi = acc[key].aggregatedInsights;
      const spend = parseFloat(insight.spend);
      const impressions = parseInt(insight.impressions, 10);
      const clicks = parseInt(insight.clicks, 10);

      gi.spend += spend;
      gi.impressions += impressions;
      gi.clicks += clicks;

      if (insight.purchase_roas?.[0]) {
        const val = parseFloat(insight.purchase_roas[0].value);
        gi.purchaseRoas += val;
        gi._roasCount! += 1;
        gi._purchaseValueSum! += val * spend;
      }

      insight.actions?.forEach(action => {
        const type = action.action_type;
        const value = parseFloat(action.value) || 0;
        gi.actions[type] = (gi.actions[type] || 0) + value;
      });
    }
    return acc;
  }, {} as Record<string, CreativeGroup>);

  computeFinalInsights(grouped);
  return grouped;
}

/* ---------- ordenação + cálculo de diferenças ------------------------------------ */

export function sortGroupsByMetric(
  grouped: Record<string, CreativeGroup>,
  metric: MetricKey
): CreativeGroup[] {
  const groups = Object.values(grouped);
  if (!groups.length) return [];

  /* 1. médias de cada métrica numéricas ------------------ */
  const metricKeys = [
    "spend",
    "impressions",
    "clicks",
    "ctr",
    "ctrLinkClick",
    "cpm",
    "cpcLinkClick",
    "costPerLandingPageView",
    "siteArrivalRate",
    "tumbstock",
    "clickToPurchase",
    "costSitePurchase",
    "purchaseRoas",
    "roasCustom",
    "landingPageViews",
    "purchase"
  ] as const;

  const avg: Record<string, number> = Object.fromEntries(
    metricKeys.map(k => [
      k,
      groups.reduce((sum, g) => sum + (g.aggregatedInsights as any)[k], 0) /
        groups.length,
    ])
  );

  const avgPurchase =
    groups.reduce(
      (sum, g) => sum + (g.aggregatedInsights.actions.purchase || 0),
      0
    ) / groups.length;

  const diffPct = (value: number, average: number) =>
    average === 0 ? 0 : ((value - average) / average) * 100;

  /* 2. grava diferença percentual em cada grupo ---------- */
  for (const g of groups) {
    const i = g.aggregatedInsights;
    i.diff = {}; // zera

    metricKeys.forEach(k => {
      i.diff[k] = diffPct((i as any)[k], avg[k]);
    });

    i.diff["purchase"] = diffPct(
      i.actions.purchase || 0,
      avgPurchase
    );
  }

  /* 3. ordena por total de compras ------------------------ */
  groups.sort((a, b) => {
    const aVal =
      metric === "purchase"
        ? a.aggregatedInsights.actions.purchase || 0
        : (a.aggregatedInsights as any)[metric] ?? 0;
    const bVal =
      metric === "purchase"
        ? b.aggregatedInsights.actions.purchase || 0
        : (b.aggregatedInsights as any)[metric] ?? 0;

    // métricas com invert=true → menor é “melhor”
    return METRIC_MAP[metric].invert ? aVal - bVal : bVal - aVal;
  });

  return groups;
}
