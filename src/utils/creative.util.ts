// lib/creativeUtils.ts

import { AdCreativeInsight } from "@/types/model/creative-insights.model";

export interface CreativeGroup {
  creative: { 
    id: string;
    name?: string;
    thumbnail_url?: string,
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
    purchaseRoas: number; // Média do ROAS do grupo
    actions: Record<string, number>;
    tumbstock: number;      // (video_view / impressions) * 100
    clickToPurchase: number; // (purchase / link_click) * 100
    costPerLandingPageView: number; // Novo: custo por visualização da landing page
    _roasCount?: number;     // Campo temporário para cálculo da média
  };
}

export function groupAdsByCreative(ads: AdCreativeInsight[]): Record<string, CreativeGroup> {
  const grouped = ads.reduce((acc, ad) => {
    const groupKey = ad.creative.object_story_spec?.video_data?.video_id || ad.creative.id;
    //CONFERIR SE OS GRUPOS ESTÃO CORRETOS
    
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
          actions: {},
          tumbstock: 0,
          clickToPurchase: 0,
          costPerLandingPageView: 0,
          _roasCount: 0,
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

    // Agrega os dados dos insights do anúncio, se disponíveis
    const insight = ad.insights?.data?.[0];
    if (insight) {
      acc[groupKey].aggregatedInsights.spend += parseFloat(insight.spend);
      acc[groupKey].aggregatedInsights.impressions += parseInt(insight.impressions, 10);
      acc[groupKey].aggregatedInsights.clicks += parseInt(insight.clicks, 10);
      if (insight.purchase_roas && insight.purchase_roas[0]) {
        acc[groupKey].aggregatedInsights.purchaseRoas += parseFloat(insight.purchase_roas[0].value);
        acc[groupKey].aggregatedInsights._roasCount = (acc[groupKey].aggregatedInsights._roasCount || 0) + 1;
      }
      // Agrega as actions
      if (insight.actions) {
        insight.actions.forEach((action) => {
          const actionType = action.action_type;
          const value = parseInt(action.value, 10);
          if (acc[groupKey].aggregatedInsights.actions[actionType]) {
            acc[groupKey].aggregatedInsights.actions[actionType] += value;
          } else {
            acc[groupKey].aggregatedInsights.actions[actionType] = value;
          }
        });
      }
    }
    return acc;
  }, {} as Record<string, CreativeGroup>);

  // Calcula as métricas agregadas para cada grupo
  Object.values(grouped).forEach((group) => {
    const insights = group.aggregatedInsights;
    
    // CTR e tumbstock
    if (insights.impressions > 0) {
      insights.ctr = (insights.clicks / insights.impressions) * 100;
      const videoViews = insights.actions["video_view"] || 0;
      insights.tumbstock = (videoViews / insights.impressions) * 100;
    } else {
      insights.ctr = 0;
      insights.tumbstock = 0;
    }
    
    // clickToPurchase: (purchase / link_click) * 100
    const purchaseCount = insights.actions["purchase"] || 0;
    const linkClicks = insights.actions["link_click"] || 0;
    insights.clickToPurchase = linkClicks > 0 ? (purchaseCount / linkClicks) * 100 : 0;
    
    // Média de purchaseRoas para o grupo
    if (insights._roasCount && insights._roasCount > 0) {
      insights.purchaseRoas = insights.purchaseRoas / insights._roasCount;
    } else {
      insights.purchaseRoas = 0;
    }
    
    // Cálculo do costPerLandingPageView: spend / landing_page_view
    const landingPageViews = insights.actions["landing_page_view"] || 0;
    insights.costPerLandingPageView = landingPageViews > 0 ? insights.spend / landingPageViews : 0;
    
    // Remove o campo temporário
    delete insights._roasCount;
  });

  return grouped;
}

export function sortGroupsByPurchases(grouped: Record<string, CreativeGroup>): CreativeGroup[] {
  return Object.values(grouped).sort((a, b) => {
    const purchaseA = a.aggregatedInsights.actions?.purchase ?? 0;
    const purchaseB = b.aggregatedInsights.actions?.purchase ?? 0;
    return purchaseB - purchaseA; // Ordena do maior para o menor
  });
}
