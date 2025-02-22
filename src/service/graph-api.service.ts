import { AdAccount } from "@/types/model/ad-account.model";
import { AdCreativeInsight, AdCreativeInsightsResponse } from "@/types/model/creative-insights.model";
import { PaginatedResponseFacebook } from "@/types/paginated-response-facebook.interface";
import axios from "axios";

const FACEBOOK_API_URL = "https://graph.facebook.com/v22.0";
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN; // Defina no .env.local

const FacebookAdsService = {
  /**
   * Obtém todas as contas de anúncios associadas ao usuário
   */
  async getAdAccounts(): Promise<AdAccount[]>  {
    const response = await axios.get(`${FACEBOOK_API_URL}/me/adaccounts?limit=60`, {
      params: {
        fields:
          "id,account_id,name,account_status,currency,amount_spent,balance,timezone_name,business",
        access_token: ACCESS_TOKEN,
      },
    });
    console.log(response);
    return response.data.data;
    return response.data.data;
  },

  async getAdInsights(
      adAccountId: string,
      since: string,
      until: string
    ): Promise<PaginatedResponseFacebook<AdInsight>> {
      const timeRange = {
        since,
        until,
      };
  
      const response = await axios.get<PaginatedResponseFacebook<AdInsight>>(
        `${FACEBOOK_API_URL}/${adAccountId}/insights`,
        {
          params: {
            level: "ad",
            fields: "ad_name,ad_id,impressions,clicks,spend,date_start,date_stop",
            time_range: JSON.stringify(timeRange),
            limit: 150,
            access_token: ACCESS_TOKEN,
          },
        }
      );
  
      return response.data;
    },

  /**
   * Obtém todas as campanhas de uma conta de anúncios
   * @param {string} adAccountId - ID da conta de anúncios (ex: "act_123456789")
   */
  async getCampaigns(adAccountId: string){
    const response = await axios.get(`${FACEBOOK_API_URL}/${adAccountId}/campaigns`, {
      params: {
        fields: "id,name,status,objective,start_time,stop_time,daily_budget",
        access_token: ACCESS_TOKEN,
      },
    });
    return response.data.data;
  },

  /**
   * Obtém os anúncios ativos (criativos) e seus insights para uma conta de anúncios.
   * @param adAccountId ID da conta de anúncios (com prefixo "act_" se necessário)
   */
  async getAllActiveAds(adAccountId: string): Promise<PaginatedResponseFacebook<AdCreativeInsight>> {
    const response = await axios.get<PaginatedResponseFacebook<AdCreativeInsight>>(
      `${FACEBOOK_API_URL}/${adAccountId}/ads`,
      {
        params: {
          fields:
            'id,name,creative{id,name,object_story_spec},insights.time_range({"since":"2024-01-01","until":"2024-03-02"}){spend,impressions,clicks,ctr,date_start,date_stop,actions,purchase_roas}',
          effective_status: '["ACTIVE"]',
          limit: 200,
          access_token: ACCESS_TOKEN,
        },
      }
    );
    return response.data;
  },

  async getFilteredAds(
    adAccountId: string,
    adIds: string[],
    since: string,
    until: string
  ): Promise<PaginatedResponseFacebook<AdCreativeInsight>> {
    // Monta o filtering
    const filtering = [
      {
        field: "ad.id",
        operator: "IN",
        value: adIds,
      },
    ];

    // Período para insights
    const timeRange = { since, until };

    const fields = [
      "id",
      "name",
      "effective_status",
      // criativo
      "creative{id,name,object_story_spec}",
      // insights com time_range
      `insights.time_range(${JSON.stringify(timeRange)}){spend,impressions,clicks,ctr,date_start,date_stop,actions,purchase_roas}`,
    ].join(",");

    const response = await axios.get<PaginatedResponseFacebook<AdCreativeInsight>>(
      `${FACEBOOK_API_URL}/${adAccountId}/ads`,
      {
        params: {
          fields,
          filtering: JSON.stringify(filtering),
          limit: 200,
          access_token: ACCESS_TOKEN,
        },
      }
    );

    return response.data;
  },

  async testeAds(adAccountId: string): Promise<any> {
    const url = `${FACEBOOK_API_URL}/${adAccountId}/ads?` +
      `fields=id,name,created_time,updated_time,effective_status&` +
      `filtering=[{"field":"ad.created_time","operator":"GREATER_THAN","value":"2025-01-01"},{"field":"ad.created_time","operator":"LESS_THAN","value":"2025-01-31"}]&` +
      `access_token=${ACCESS_TOKEN}`;
  
    const response = await axios.get<any>(url);
    return response.data;
  },
  

  async fetchVideoSource(videoId: string): Promise<string | null> {
    try {
      const response = await axios.get(`${FACEBOOK_API_URL}/${videoId}`, {
        params: {
          fields: "source",
          access_token: ACCESS_TOKEN,
        },
      });
      return response.data.source;
    } catch (error) {
      console.error("Erro ao buscar URL do vídeo:", error);
      return null;
    }
  },
  
  /**
   * Obtém todos os conjuntos de anúncios de uma campanha
   * @param {string} campaignId - ID da campanha
   */
  async getAdSets(campaignId: string) {
    const response = await axios.get(`${FACEBOOK_API_URL}/${campaignId}/adsets`, {
      params: {
        fields: "id,name,status,daily_budget,start_time,end_time",
        access_token: ACCESS_TOKEN,
      },
    });
    return response.data.data;
  },

  /**
   * Obtém todos os anúncios de um conjunto de anúncios
   * @param {string} adSetId - ID do conjunto de anúncios
   */
  async getAds(adSetId: string) {
    const response = await axios.get(`${FACEBOOK_API_URL}/${adSetId}/ads`, {
      params: {
        fields: "id,name,status,creative{thumbnail_url,image_url,video_id}",
        access_token: ACCESS_TOKEN,
      },
    });
    return response.data.data;
  },

  /**
   * Obtém detalhes de um criativo de anúncio (imagem/vídeo)
   * @param {string} creativeId - ID do criativo
   */
  async getCreative(creativeId: string) {
    const response = await axios.get(`${FACEBOOK_API_URL}/${creativeId}`, {
      params: {
        fields: "id,name,thumbnail_url,image_url,video_id",
        access_token: ACCESS_TOKEN,
      },
    });
    return response.data;
  },
  
  async getCreativeInsights(adAccountId: string): Promise<AdCreativeInsightsResponse> {
    const response = await axios.get<AdCreativeInsightsResponse>(`${FACEBOOK_API_URL}/${adAccountId}/ads`, {
      params: {
        fields: "id,name,creative{id},insights{spend,impressions,clicks,ctr,date_start,date_stop}",
        access_token: ACCESS_TOKEN,
      },
    });

    return response.data;
  }
}


export default FacebookAdsService;
