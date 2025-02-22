// lib/creativeUtils.ts

import { AdCreativeInsight } from "@/types/model/creative-insights.model";

export interface CreativeGroup {
  creative: { 
    id: string;
    name?: string;
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
    actions: Record<string, number>; 
  };
}

export function groupAdsByCreative(ads: AdCreativeInsight[]): Record<string, CreativeGroup> {
  const grouped = ads.reduce((acc, ad) => {
    const videoId = ad.creative.object_story_spec?.video_data?.video_id || 0;
    
    // Se o grupo para esse criativo ainda não existir, cria-o
    if (!acc[videoId]) {
      acc[videoId] = {
        creative: { ...ad.creative },
        ads: [],
        aggregatedInsights: {
          spend: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          purchaseRoas: 0,
          actions: {} // inicializa o objeto de ações
        },
      };
    } else {
      // Se já existe, e o grupo ainda não possui object_story_spec, tenta atribuir
      if (!acc[videoId].creative.object_story_spec && ad.creative.object_story_spec) {
        acc[videoId].creative.object_story_spec = ad.creative.object_story_spec;
      }
    }

    // Adiciona o anúncio ao grupo
    acc[videoId].ads.push(ad);

    // Agrega os dados dos insights do anúncio, se disponíveis
    const insight = ad.insights?.data?.[0];
    if (insight) {
      acc[videoId].aggregatedInsights.spend += parseFloat(insight.spend);
      acc[videoId].aggregatedInsights.impressions += parseInt(insight.impressions, 10);
      acc[videoId].aggregatedInsights.clicks += parseInt(insight.clicks, 10);
      if (insight.purchase_roas && insight.purchase_roas[0]) {
        acc[videoId].aggregatedInsights.purchaseRoas += parseFloat(insight.purchase_roas[0].value);
      }
      // Agrupa as actions
      if (insight.actions) {
        insight.actions.forEach((action) => {
          const actionType = action.action_type;
          const value = parseInt(action.value, 10);
          if (acc[videoId].aggregatedInsights.actions[actionType]) {
            acc[videoId].aggregatedInsights.actions[actionType] += value;
          } else {
            acc[videoId].aggregatedInsights.actions[actionType] = value;
          }
        });
      }
    }
    return acc;
  }, {} as Record<string, CreativeGroup>);

  // Calcula o CTR agregado para cada grupo
  Object.values(grouped).forEach((group) => {
    if (group.aggregatedInsights.impressions > 0) {
      group.aggregatedInsights.ctr =
        (group.aggregatedInsights.clicks / group.aggregatedInsights.impressions) * 100;
    } else {
      group.aggregatedInsights.ctr = 0;
    }
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