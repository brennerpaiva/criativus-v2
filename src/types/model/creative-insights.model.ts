export interface Creative {
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
  }
  
  export interface Action {
    action_type: string;
    value: string;
  }
  
  export interface PurchaseRoas {
    value: string;
  }
  
  export interface InsightData {
    spend: string;
    impressions: string;
    clicks: string;
    ctr: string;
    date_start: string;
    date_stop: string;
    actions?: Action[]; // Adicionando ações (como purchases)
    purchase_roas?: PurchaseRoas[]; // Adicionando ROAS (Return on Ad Spend)
  }
  
  export interface Insights {
    data: InsightData[];
    paging?: {
      cursors?: {
        before: string;
        after: string;
      };
    };
  }
  
  export interface AdCreativeInsight {
    id: string;
    ad_id: string;
    name: string;
    creative: Creative;
    insights?: Insights;
  }
  
  export interface AdCreativeInsightsResponse {
    data: AdCreativeInsight[];
    paging?: {
      cursors?: {
        before: string;
        after: string;
      };
      next?: string;
    };
  }
  