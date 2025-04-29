// lib/creativeUtils.ts

import { AdCreativeInsight } from "@/types/model/creative-insights.model";

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
        call_to_action: {
          type: string;
          value: {
            link: string;
          };
        };
        image_url?: string;
        image_hash?: string;
      };
    };
  };
  ads: AdCreativeInsight[];
  aggregatedInsights: {
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

    // Novos campos
    cpm: number;               
    cpcLinkClick: number;      
    landingPageViews: number;  
    siteArrivalRate: number;   // landing_page_view / link_click * 100

    // Campos internos para cálculo
    _roasCount?: number;
    _purchaseValueSum?: number;
  };
}

export function groupAdsByCreative(
  ads: AdCreativeInsight[]
): Record<string, CreativeGroup> {
  const grouped = ads.reduce((acc, ad) => {
    // Se o anúncio tiver video_data, agrupa pelo ID do vídeo; senão, agrupa pelo ID do creative
    const groupKey =
      ad.creative.object_story_spec?.video_data?.video_id || ad.creative?.image_url || ad.name || ad.creative.id;

    // Cria o grupo se não existir
    if (!acc[groupKey]) {
      acc[groupKey] = {
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

          _roasCount: 0,
          _purchaseValueSum: 0,
        },
      };
    } else {
      // Se já existe e o grupo ainda não possui object_story_spec, tenta atribuir
      if (!acc[groupKey].creative.object_story_spec && ad.creative.object_story_spec) {
        acc[groupKey].creative.object_story_spec = ad.creative.object_story_spec;
      }
    }

    // Adiciona o anúncio ao grupo
    acc[groupKey].ads.push(ad);

    // Agrega dados do insight desse anúncio, se houver
    const insight = ad.insights?.data?.[0];
    if (insight) {
      const groupInsights = acc[groupKey].aggregatedInsights;

      // Soma spends, impressões e cliques
      const spend = parseFloat(insight.spend);
      const impressions = parseInt(insight.impressions, 10);
      const clicks = parseInt(insight.clicks, 10);

      groupInsights.spend += spend;
      groupInsights.impressions += impressions;
      groupInsights.clicks += clicks;

      // Soma a métrica de purchase_roas do FB
      if (insight.purchase_roas && insight.purchase_roas[0]) {
        const roasFB = parseFloat(insight.purchase_roas[0].value);
        groupInsights.purchaseRoas += roasFB;
        groupInsights._roasCount! += 1;

        // Também multiplica roasFB * spend para somar à "receita" total do grupo
        groupInsights._purchaseValueSum! += roasFB * spend;
      }

      // Agrega as actions
      if (insight.actions) {
        insight.actions.forEach((action) => {
          const actionType = action.action_type;
          const value = parseFloat(action.value) || 0;
          groupInsights.actions[actionType] =
            (groupInsights.actions[actionType] || 0) + value;
        });
      }
    }

    return acc;
  }, {} as Record<string, CreativeGroup>);

  // Calcula as métricas finais de cada grupo
  Object.values(grouped).forEach((group) => {
    const insights = group.aggregatedInsights;
    const { actions } = insights;

    // CTR geral (se útil)
    if (insights.impressions > 0) {
      insights.ctr = (insights.clicks / insights.impressions) * 100;
    }

    // link_click para outras métricas
    const linkClicks = actions["link_click"] || 0;

    // CTR (link click) = (link_click / impressions) * 100
    if (insights.impressions > 0) {
      insights.ctrLinkClick = (linkClicks / insights.impressions) * 100;
    }

    // CPC (link click) = spend / link_click
    insights.cpcLinkClick = linkClicks > 0 ? insights.spend / linkClicks : 0;

    // CPM = (spend / impressions) * 1000
    insights.cpm =
      insights.impressions > 0
        ? (insights.spend / insights.impressions) * 1000
        : 0;

    // Tumbstock = (video_view / impressions) * 100
    const videoViews = actions["video_view"] || 0;
    if (insights.impressions > 0) {
      insights.tumbstock = (videoViews / insights.impressions) * 100;
    }

    // Landing Page Views
    const landingPageViews = actions["landing_page_view"] || 0;
    insights.landingPageViews = landingPageViews;

    // Cost per Landing Page View = spend / landing_page_view
    insights.costPerLandingPageView =
      landingPageViews > 0 ? insights.spend / landingPageViews : 0;

    // Taxa de chegada ao Site = (landing_page_view / link_click) * 100
    insights.siteArrivalRate =
      linkClicks > 0 ? (landingPageViews / linkClicks) * 100 : 0;

    // clickToPurchase = (purchase / link_click) * 100
    const purchaseCount = actions["purchase"] || 0;
    insights.clickToPurchase =
      linkClicks > 0 ? (purchaseCount / linkClicks) * 100 : 0;

    // Se tiver ROAS do FB, faz a média
    if (insights._roasCount && insights._roasCount > 0) {
      insights.purchaseRoas = insights.purchaseRoas / insights._roasCount;
    } else {
      insights.purchaseRoas = 0;
    }

    // roasCustom = (soma da receita) / (spend total)
    if (insights.spend > 0) {
      insights.roasCustom = insights._purchaseValueSum! / insights.spend;
    } else {
      insights.roasCustom = 0;
    }

    // costSitePurchase = spend / purchase
    insights.costSitePurchase =
      purchaseCount > 0 ? insights.spend / purchaseCount : 0;

    // Remove campos temporários
    delete insights._roasCount;
    delete insights._purchaseValueSum;
  });

  return grouped;
}

export function sortGroupsByPurchases(
  grouped: Record<string, CreativeGroup>
): CreativeGroup[] {
  return Object.values(grouped).sort((a, b) => {
    const purchaseA = a.aggregatedInsights.actions.purchase ?? 0;
    const purchaseB = b.aggregatedInsights.actions.purchase ?? 0;
    // Maior para menor
    return purchaseB - purchaseA;
  });
}
