// lib/creativeUtils.ts

import { AdCreativeInsight } from "@/types/model/creative-insights.model";

export interface CreativeGroup {
  creative: { 
    id: string;
    name?: string;
    thumbnail_url?: string;
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
    purchaseRoas: number;            // Média do ROAS do grupo (do FB)
    roasCustom: number;              // Novo: média ponderada de purchase_roas
    actions: Record<string, number>;
    tumbstock: number;               // (video_view / impressions) * 100
    clickToPurchase: number;         // (purchase / link_click) * 100
    costPerLandingPageView: number;  // custo por visualização da landing page
    ctrLinkClick: number;            // (link_click / impressions) * 100
    costSitePurchase: number;        // spend / "purchase"
    
    _roasCount?: number;             // Campo temporário para calcular média de roas do FB
    _purchaseValueSum?: number;      // Soma parcial de "receita" (purchase_roas * spend)
  };
}

export function groupAdsByCreative(ads: AdCreativeInsight[]): Record<string, CreativeGroup> {
  const grouped = ads.reduce((acc, ad) => {
    // Se o anúncio tiver video_data, agrupa pelo ID do vídeo; senão, agrupa pelo ID do creative
    const groupKey = ad.creative.object_story_spec?.video_data?.video_id || ad.creative.id;

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

          // Campos internos para cálculo
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

    // Agrega os dados do insight desse anúncio, se houver
    const insight = ad.insights?.data?.[0];
    if (insight) {
      const groupInsights = acc[groupKey].aggregatedInsights;

      // soma spends/impressões/cliques
      const spend = parseFloat(insight.spend);
      groupInsights.spend += spend;
      groupInsights.impressions += parseInt(insight.impressions, 10);
      groupInsights.clicks += parseInt(insight.clicks, 10);

      // Soma a métrica de purchase_roas do FB
      if (insight.purchase_roas && insight.purchase_roas[0]) {
        const roasFB = parseFloat(insight.purchase_roas[0].value);
        groupInsights.purchaseRoas += roasFB;
        groupInsights._roasCount! += 1;

        // Também multiplica roasFB * spend para somar à receita total do grupo
        groupInsights._purchaseValueSum! += roasFB * spend;
      }

      // Agrega as actions
      if (insight.actions) {
        insight.actions.forEach((action) => {
          const actionType = action.action_type;
          const value = parseFloat(action.value) || 0;
          groupInsights.actions[actionType] = (groupInsights.actions[actionType] || 0) + value;
        });
      }
    }

    return acc;
  }, {} as Record<string, CreativeGroup>);

  // Calcula as métricas finais de cada grupo
  Object.values(grouped).forEach((group) => {
    const insights = group.aggregatedInsights;
    const { actions } = insights;

    // CTR = (clicks / impressions) * 100
    if (insights.impressions > 0) {
      insights.ctr = (insights.clicks / insights.impressions) * 100;
    }

    // ctrLinkClick = (link_click / impressions) * 100
    const linkClicks = actions["link_click"] || 0;
    if (insights.impressions > 0) {
      insights.ctrLinkClick = (linkClicks / insights.impressions) * 100;
    }

    // tumbstock = (video_view / impressions) * 100
    const videoViews = actions["video_view"] || 0;
    if (insights.impressions > 0) {
      insights.tumbstock = (videoViews / insights.impressions) * 100;
    }

    // clickToPurchase = (purchase / link_click) * 100
    const purchaseCount = actions["purchase"] || 0; 
    insights.clickToPurchase = linkClicks > 0 ? (purchaseCount / linkClicks) * 100 : 0;

    // Se tiver ROAS do FB, faz a média
    if (insights._roasCount && insights._roasCount > 0) {
      insights.purchaseRoas = insights.purchaseRoas / insights._roasCount;
    } else {
      insights.purchaseRoas = 0;
    }

    // roasCustom = (soma da receita) / (spend total)
    // onde "receita" de cada anúncio = roasDoFB * spend
    if (insights.spend > 0) {
      insights.roasCustom = insights._purchaseValueSum! / insights.spend;
    } else {
      insights.roasCustom = 0;
    }

    // costPerLandingPageView = spend / landing_page_view
    const landingPageViews = actions["landing_page_view"] || 0;
    insights.costPerLandingPageView =
      landingPageViews > 0 ? insights.spend / landingPageViews : 0;

    // costSitePurchase = spend / purchase
    insights.costSitePurchase = purchaseCount > 0
      ? insights.spend / purchaseCount
      : 0;

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
    return purchaseB - purchaseA; // maior para menor
  });
}
