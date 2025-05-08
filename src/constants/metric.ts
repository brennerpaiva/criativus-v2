import { CreativeGroup } from "@/utils/creative.util";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/number-format";

/* --------------------------------------------------
 * Métricas disponíveis e mapeamento dos campos do
 * aggregatedInsights + diff ➜ componente Card.
 * -------------------------------------------------*/
export const METRIC_MAP = {
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

export type MetricKey = keyof typeof METRIC_MAP;
  
  
