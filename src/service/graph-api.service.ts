import { AdAccount } from '@/types/model/ad-account.model';
import {
 AdCreativeInsight,
 AdCreativeInsightsResponse,
} from '@/types/model/creative-insights.model';
import { PaginatedResponseFacebook } from '@/types/paginated-response-facebook.interface';
import axios from 'axios';
import { useFacebookStore } from '@/store/facebook.store';

const FACEBOOK_API_URL = 'https://graph.facebook.com/v22.0';

// Recupera o token do Facebook armazenado em zustand
function getFacebookToken(): string {
 const token = useFacebookStore.getState().token;
 if (token) {
  return token;
 }
 throw new Error('Token do Facebook não disponível');
}

const FacebookAdsService = {
 async getAdAccounts(): Promise<AdAccount[]> {
  const tokenFb = getFacebookToken();
  const response = await axios.get(
   `${FACEBOOK_API_URL}/me/adaccounts?limit=300`,
   {
    params: {
     fields:
      'id,account_id,name,account_status,currency,amount_spent,balance,timezone_name,business',
     access_token: tokenFb,
    },
   }
  );
  return response.data.data;
 },

 async getAdInsights(
  adAccountId: string,
  since: string,
  until: string
 ): Promise<PaginatedResponseFacebook<AdCreativeInsight>> {
  const tokenFb = getFacebookToken();
  const timeRange = { since, until };
  const response = await axios.get<
   PaginatedResponseFacebook<AdCreativeInsight>
  >(`${FACEBOOK_API_URL}/${adAccountId}/insights`, {
   params: {
    level: 'ad',
    fields: 'ad_name,ad_id,impressions,clicks,spend,date_start,date_stop',
    time_range: JSON.stringify(timeRange),
    limit: 150,
    access_token: tokenFb,
   },
  });
  return response.data;
 },

 /**
  * Retorna metadados de um vídeo específico
  * @param videoId string
  * @param accessToken string
  */
 async getVideoCreative(videoId: string) {
  const tokenFb = getFacebookToken();
  // Aqui você pode adaptar para sua versão / requirements de permissões
  const fields = 'source,thumbnails';
  const response = await axios.get(`${FACEBOOK_API_URL}/${videoId}`, {
   params: {
    fields,
    access_token: tokenFb,
   },
  });
  return response.data; // Ex.: { id: "...", source: "https://..." }
 },

 async getCampaigns(adAccountId: string) {
  const tokenFb = getFacebookToken();
  const response = await axios.get(
   `${FACEBOOK_API_URL}/${adAccountId}/campaigns`,
   {
    params: {
     fields: 'id,name,status,objective,start_time,stop_time,daily_budget',
     access_token: tokenFb,
    },
   }
  );
  return response.data.data;
 },

 async getAllActiveAds(
  adAccountId: string
 ): Promise<PaginatedResponseFacebook<AdCreativeInsight>> {
  const tokenFb = getFacebookToken();
  const response = await axios.get<
   PaginatedResponseFacebook<AdCreativeInsight>
  >(`${FACEBOOK_API_URL}/${adAccountId}/ads`, {
   params: {
    fields:
     'id,name,creative{id,name,object_story_spec},insights.time_range({"since":"2024-01-01","until":"2024-03-02"}){spend,impressions,clicks,ctr,date_start,date_stop,actions,purchase_roas}',
    effective_status: '["ACTIVE"]',
    limit: 200,
    access_token: tokenFb,
   },
  });
  return response.data;
 },

 async getFilteredAds(
  adAccountId: string,
  adIds: string[],
  since: string,
  until: string
 ): Promise<PaginatedResponseFacebook<AdCreativeInsight>> {
  const tokenFb = getFacebookToken();
  const filtering = [
   {
    field: 'ad.id',
    operator: 'IN',
    value: adIds,
   },
  ];
  const timeRange = { since, until };
  const fields = [
   'id',
   'name',
   'effective_status',
   'creative{id,name,object_story_spec,image_url,thumbnail_url}',
   `insights.time_range(${JSON.stringify(timeRange)}){spend,impressions,clicks,ctr,date_start,date_stop,actions,purchase_roas}`,
  ].join(',');
  const response = await axios.get<
   PaginatedResponseFacebook<AdCreativeInsight>
  >(`${FACEBOOK_API_URL}/${adAccountId}/ads`, {
   params: {
    fields,
    filtering: JSON.stringify(filtering),
    limit: 1000,
    access_token: tokenFb,
   },
  });
  return response.data;
 },

 async testeAds(adAccountId: string): Promise<any> {
  const tokenFb = getFacebookToken();
  const url =
   `${FACEBOOK_API_URL}/${adAccountId}/ads?` +
   `fields=id,name,created_time,updated_time,effective_status&` +
   `filtering=[{"field":"ad.created_time","operator":"GREATER_THAN","value":"2025-01-01"},{"field":"ad.created_time","operator":"LESS_THAN","value":"2025-01-31"}]&` +
   `access_token=${tokenFb}`;
  const response = await axios.get<any>(url);
  return response.data;
 },

 async getAdSets(campaignId: string) {
  const tokenFb = getFacebookToken();
  const response = await axios.get(`${FACEBOOK_API_URL}/${campaignId}/adsets`, {
   params: {
    fields: 'id,name,status,daily_budget,start_time,end_time',
    access_token: tokenFb,
   },
  });
  return response.data.data;
 },

 async getAds(adSetId: string) {
  const tokenFb = getFacebookToken();
  const response = await axios.get(`${FACEBOOK_API_URL}/${adSetId}/ads`, {
   params: {
    fields: 'id,name,status,creative{thumbnail_url,image_url,video_id}',
    access_token: tokenFb,
   },
  });
  return response.data.data;
 },

 async getCreative(creativeId: string) {
  const tokenFb = getFacebookToken();
  const response = await axios.get(`${FACEBOOK_API_URL}/${creativeId}`, {
   params: {
    fields: 'id,name,thumbnail_url,image_url,video_id',
    access_token: tokenFb,
   },
  });
  return response.data;
 },

 async getCreativeInsights(
  adAccountId: string
 ): Promise<AdCreativeInsightsResponse> {
  const tokenFb = getFacebookToken();
  const response = await axios.get<AdCreativeInsightsResponse>(
   `${FACEBOOK_API_URL}/${adAccountId}/ads`,
   {
    params: {
     fields:
      'id,name,creative{id},insights{spend,impressions,clicks,ctr,date_start,date_stop}',
     access_token: tokenFb,
    },
   }
  );
  return response.data;
 },
};

export default FacebookAdsService;
