import { AdAccount } from "@/types/model/ad-account.model";
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
  
  async getCreativeInsights(adAccountId: string) {
      const response = await axios.get(`${FACEBOOK_API_URL}/${adAccountId}/ads`, {
        params: {
          fields: "id,name,creative{id},insights{spend,impressions,clicks,ctr,conversions}",
          access_token: ACCESS_TOKEN,
        },
      });
  
      const ads = response.data.data;
      console.log(response);
  
      // Mapear para extrair os criativos e métricas relevantes
      const creativesWithMetrics = ads.map((ad: any) => ({
        id: ad.creative?.id,
        name: ad.name,
        spend: ad.insights?.spend || "0",
        impressions: ad.insights?.impressions || "0",
        clicks: ad.insights?.clicks || "0",
        ctr: ad.insights?.ctr || "0",
        conversions: ad.insights?.conversions || "0",
      }));
  
      return creativesWithMetrics;
    }
}


export default FacebookAdsService;
